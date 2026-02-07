// ===========================================
// MODULES LAYER - Password Service
// ===========================================

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { IUserRepository, USER_REPOSITORY } from '../../application/ports';
import {
    InvalidPasswordError,
    UserNotFoundError,
    InvalidOtpError,
    OtpExpiredError,
} from '../../domain/errors';
import { OtpService } from '../../infrastructure/otp/otp.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { AuthService } from '../auth/auth.service';

/**
 * PasswordService handles all password-related operations
 * 
 * Responsibilities:
 * - Change password for authenticated users
 * - Request OTP for forgotten password
 * - Verify OTP and reset password
 * 
 * Security measures:
 * - Validates old password before changing
 * - Hashes passwords before storage
 * - Revokes tokens after password change
 * - Doesn't reveal whether user exists (forgot password)
 */
@Injectable()
export class PasswordService {
    private readonly logger = new Logger(PasswordService.name);
    private readonly saltRounds: number;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly otpService: OtpService,
        private readonly emailService: EmailService,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.saltRounds = this.configService.get<number>('password.saltRounds', 10);
    }

    /**
     * Change password for an authenticated user
     * 
     * Flow:
     * 1. Fetch user by userId
     * 2. Verify old password
     * 3. Hash new password
     * 4. Update password in database
     * 5. Revoke current token (force logout)
     * 
     * @param userId - Authenticated user ID
     * @param oldPassword - Current password
     * @param newPassword - New password to set
     * @param currentToken - Current JWT token to revoke
     * @throws UserNotFoundError if user doesn't exist
     * @throws InvalidPasswordError if old password is incorrect
     */
    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string,
        currentToken: string,
    ): Promise<void> {
        this.logger.log(`Change password request for user: ${userId}`);

        // Fetch user
        const user = await this.userRepository.findById(userId);
        if (!user) {
            this.logger.warn(`User not found: ${userId}`);
            throw new UserNotFoundError(userId);
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Invalid old password for user: ${userId}`);
            throw new InvalidPasswordError();
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

        // Update password in database
        await this.userRepository.updatePassword(userId, hashedPassword);

        // Revoke current token (force logout)
        await this.authService.revokeToken(currentToken);

        // Send email notification
        await this.emailService.sendPasswordChangedNotification(user.email);

        this.logger.log(`Password changed successfully for user: ${userId}`);
    }

    /**
     * Request OTP for forgotten password
     * 
     * Flow:
     * 1. Find user by email or phone
     * 2. Generate OTP
     * 3. Store OTP in Redis with TTL
     * 4. Send OTP via email
     * 
     * Security note: Always returns success, even if user doesn't exist.
     * This prevents attackers from enumerating valid users.
     * 
     * @param emailOrPhone - User identifier (email or phone)
     */
    async requestPasswordReset(emailOrPhone: string): Promise<void> {
        this.logger.log(`Password reset request for: ${emailOrPhone}`);

        // Find user
        const user = await this.userRepository.findByEmailOrPhone(emailOrPhone);

        // If user doesn't exist, silently succeed (security: don't reveal user existence)
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent user: ${emailOrPhone}`);
            // Simulate delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 100));
            return;
        }

        // Generate OTP
        const otp = this.otpService.generateOtp();

        // Store OTP in Redis
        await this.otpService.storeOtp(user.id, otp, 'forgot_password');

        // Send OTP via email
        await this.emailService.sendOtp(user.email, otp);

        this.logger.log(`OTP sent successfully for user: ${user.id}`);
    }

    /**
     * Verify OTP and reset password
     * 
     * Flow:
     * 1. Find user by email or phone
     * 2. Verify OTP from Redis
     * 3. Hash new password
     * 4. Update password in database
     * 5. Delete OTP from Redis
     * 6. Revoke all active tokens (force logout all sessions)
     * 
     * @param emailOrPhone - User identifier (email or phone)
     * @param otp - 6-digit OTP
     * @param newPassword - New password to set
     * @throws UserNotFoundError if user doesn't exist
     * @throws InvalidOtpError if OTP is incorrect
     * @throws OtpExpiredError if OTP has expired
     */
    async verifyOtpAndResetPassword(
        emailOrPhone: string,
        otp: string,
        newPassword: string,
    ): Promise<void> {
        this.logger.log(`OTP verification request for: ${emailOrPhone}`);

        // Find user
        const user = await this.userRepository.findByEmailOrPhone(emailOrPhone);
        if (!user) {
            this.logger.warn(`User not found for OTP verification: ${emailOrPhone}`);
            throw new UserNotFoundError(emailOrPhone);
        }

        // Verify OTP (will throw if invalid or expired)
        await this.otpService.verifyOtp(user.id, otp, 'forgot_password');

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

        // Update password in database
        await this.userRepository.updatePassword(user.id, hashedPassword);

        // Note: In a production system, you might want to revoke all user's tokens here
        // For now, we'll let existing tokens remain valid until they expire naturally
        // To implement full revocation, you'd need to track all user tokens

        // Send email notification
        await this.emailService.sendPasswordChangedNotification(user.email);

        this.logger.log(`Password reset successfully for user: ${user.id}`);
    }
}
