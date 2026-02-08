// ===========================================
// APPLICATION LAYER - Verify OTP And Reset Password Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../ports';
import { IPasswordHashService, PASSWORD_HASH_SERVICE } from '../../ports/password-hash.service.port';
import { IOtpService, OTP_SERVICE } from '../../ports/otp.service.port';
import { IEmailService, EMAIL_SERVICE } from '../../ports/email.service.port';
import { UserNotFoundError } from '../../../domain/errors';

export interface VerifyOtpAndResetPasswordInput {
    emailOrPhone: string;
    otp: string;
    newPassword: string;
}

@Injectable()
export class VerifyOtpAndResetPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(PASSWORD_HASH_SERVICE)
        private readonly passwordHashService: IPasswordHashService,
        @Inject(OTP_SERVICE)
        private readonly otpService: IOtpService,
        @Inject(EMAIL_SERVICE)
        private readonly emailService: IEmailService,
    ) { }

    async execute(input: VerifyOtpAndResetPasswordInput): Promise<void> {
        const { emailOrPhone, otp, newPassword } = input;

        // Find user
        const user = await this.userRepository.findByEmailOrPhone(emailOrPhone);
        if (!user) {
            throw new UserNotFoundError(emailOrPhone);
        }

        // Verify OTP (will throw if invalid or expired)
        await this.otpService.verifyOtp(user.id, otp, 'forgot_password');

        // Hash new password
        const hashedPassword = await this.passwordHashService.hash(newPassword);

        // Update password in database
        await this.userRepository.updatePassword(user.id, hashedPassword);

        // Send email notification
        await this.emailService.sendPasswordChangedNotification(user.email);
    }
}
