// ===========================================
// APPLICATION LAYER - Change Password Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../ports';
import { IPasswordHashService, PASSWORD_HASH_SERVICE } from '../../ports/password-hash.service.port';
import { IEmailService, EMAIL_SERVICE } from '../../ports/email.service.port';
import { ITokenBlacklistService, TOKEN_BLACKLIST_SERVICE } from '../../ports/services/token-blacklist.service.port';
import { ITokenService, TOKEN_SERVICE } from '../../ports/services/token.service.port';
import { InvalidPasswordError, UserNotFoundError } from '../../../domain/errors';

export interface ChangePasswordInput {
    userId: string;
    oldPassword: string;
    newPassword: string;
    currentToken: string;
}

@Injectable()
export class ChangePasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(PASSWORD_HASH_SERVICE)
        private readonly passwordHashService: IPasswordHashService,
        @Inject(EMAIL_SERVICE)
        private readonly emailService: IEmailService,
        @Inject(TOKEN_BLACKLIST_SERVICE)
        private readonly tokenBlacklistService: ITokenBlacklistService,
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenService,
    ) { }

    async execute(input: ChangePasswordInput): Promise<void> {
        const { userId, oldPassword, newPassword, currentToken } = input;

        // Fetch user
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // Verify old password
        const isPasswordValid = await this.passwordHashService.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new InvalidPasswordError();
        }

        // Hash new password
        const hashedPassword = await this.passwordHashService.hash(newPassword);

        // Update password in database
        await this.userRepository.updatePassword(userId, hashedPassword);

        // Revoke current token (force logout)
        // Get TTL from token
        const decoded = this.tokenService.decode(currentToken);
        const ttlSeconds = decoded && decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;

        if (ttlSeconds > 0) {
            await this.tokenBlacklistService.add(currentToken, ttlSeconds);
        }

        // Send email notification
        await this.emailService.sendPasswordChangedNotification(user.email);
    }
}
