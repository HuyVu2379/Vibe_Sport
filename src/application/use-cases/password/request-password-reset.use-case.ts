// ===========================================
// APPLICATION LAYER - Request Password Reset Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../ports';
import { IOtpService, OTP_SERVICE } from '../../ports/otp.service.port';
import { IEmailService, EMAIL_SERVICE } from '../../ports/email.service.port';

export interface RequestPasswordResetInput {
    emailOrPhone: string;
}

@Injectable()
export class RequestPasswordResetUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(OTP_SERVICE)
        private readonly otpService: IOtpService,
        @Inject(EMAIL_SERVICE)
        private readonly emailService: IEmailService,
    ) { }

    async execute(input: RequestPasswordResetInput): Promise<void> {
        const { emailOrPhone } = input;

        // Find user
        const user = await this.userRepository.findByEmailOrPhone(emailOrPhone);

        // If user doesn't exist, silently succeed (security: don't reveal user existence)
        if (!user) {
            // Simulate delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 100));
            return;
        }

        // Generate OTP
        const otp = this.otpService.generateOtp();

        // Store OTP
        await this.otpService.storeOtp(user.id, otp, 'forgot_password');

        // Send OTP via email
        await this.emailService.sendOtp(user.email, otp);
    }
}
