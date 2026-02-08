// ===========================================
// INFRASTRUCTURE LAYER - OTP Service
// ===========================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { InvalidOtpError, OtpExpiredError, OtpNotFoundError } from '../../domain/errors';
import { IOtpService } from '../../application/ports/otp.service.port';

/**
 * OTP types for different use cases
 */
export type OtpType = 'forgot_password';

/**
 * OtpService handles OTP generation, storage, and verification using Redis
 * 
 * Key features:
 * - Generates secure 6-digit numeric OTPs
 * - Stores OTPs in Redis with configurable TTL (default: 5 minutes)
 * - Verifies and automatically deletes OTPs after successful validation
 * - Uses type-safe key format: otp:{type}:{userId}
 */
@Injectable()
export class OtpService implements IOtpService {
    private readonly logger = new Logger(OtpService.name);
    private readonly otpTtlSeconds: number;
    private readonly otpLength: number;

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {
        // Load OTP configuration from environment
        this.otpTtlSeconds = this.configService.get<number>('otp.ttlSeconds', 300); // Default: 5 minutes
        this.otpLength = this.configService.get<number>('otp.length', 6); // Default: 6 digits
    }

    /**
     * Generate a random numeric OTP
     * @returns A string of random digits (default length: 6)
     */
    generateOtp(): string {
        const min = Math.pow(10, this.otpLength - 1);
        const max = Math.pow(10, this.otpLength) - 1;
        const otp = Math.floor(min + Math.random() * (max - min + 1));
        return otp.toString();
    }

    /**
     * Store OTP in Redis with TTL
     * @param userId - User identifier
     * @param otp - The OTP to store
     * @param type - OTP type (e.g., 'forgot_password')
     */
    async storeOtp(userId: string, otp: string, type: OtpType): Promise<void> {
        const key = this.buildOtpKey(userId, type);

        try {
            await this.redisService.set(key, otp, this.otpTtlSeconds);
            this.logger.log(`OTP stored for user ${userId} with type ${type}, TTL: ${this.otpTtlSeconds}s`);
        } catch (error) {
            this.logger.error(`Failed to store OTP for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Verify OTP and delete it from Redis if valid
     * @param userId - User identifier
     * @param otp - The OTP to verify
     * @param type - OTP type (e.g., 'forgot_password')
     * @throws OtpNotFoundError if OTP doesn't exist
     * @throws InvalidOtpError if OTP doesn't match
     * @throws OtpExpiredError if OTP has expired (Redis returns null)
     */
    async verifyOtp(userId: string, otp: string, type: OtpType): Promise<void> {
        const key = this.buildOtpKey(userId, type);

        try {
            // Retrieve OTP from Redis
            const storedOtp = await this.redisService.get(key);

            if (!storedOtp) {
                // OTP either never existed or has expired
                this.logger.warn(`OTP not found or expired for user ${userId}`);
                throw new OtpExpiredError();
            }

            // Verify OTP matches
            if (storedOtp !== otp) {
                this.logger.warn(`Invalid OTP attempt for user ${userId}`);
                throw new InvalidOtpError();
            }

            // OTP is valid, delete it from Redis (one-time use)
            await this.redisService.del(key);
            this.logger.log(`OTP verified and deleted for user ${userId}`);
        } catch (error) {
            // Re-throw domain errors
            if (error instanceof OtpExpiredError || error instanceof InvalidOtpError) {
                throw error;
            }
            // Log and re-throw unexpected errors
            this.logger.error(`Error verifying OTP for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Delete OTP from Redis
     * @param userId - User identifier
     * @param type - OTP type (e.g., 'forgot_password')
     */
    async deleteOtp(userId: string, type: OtpType): Promise<void> {
        const key = this.buildOtpKey(userId, type);

        try {
            await this.redisService.del(key);
            this.logger.log(`OTP deleted for user ${userId} with type ${type}`);
        } catch (error) {
            this.logger.error(`Failed to delete OTP for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Build Redis key for OTP storage
     * Format: otp:{type}:{userId}
     */
    private buildOtpKey(userId: string, type: OtpType): string {
        return `otp:${type}:${userId}`;
    }
}
