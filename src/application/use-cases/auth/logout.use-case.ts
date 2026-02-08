// ===========================================
// APPLICATION LAYER - Logout Use Case
// Handles token revocation
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { ITokenService, TOKEN_SERVICE } from '../../ports/services/token.service.port';
import { ITokenBlacklistService, TOKEN_BLACKLIST_SERVICE } from '../../ports/services/token-blacklist.service.port';

export interface LogoutInput {
    token: string;
}

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenService,
        @Inject(TOKEN_BLACKLIST_SERVICE)
        private readonly tokenBlacklistService: ITokenBlacklistService,
    ) { }

    /**
     * Revoke a JWT token by adding it to blacklist
     * The token will be stored with TTL matching token expiration
     */
    async execute(input: LogoutInput): Promise<void> {
        try {
            // Decode token to get expiration time
            const decoded = this.tokenService.decode(input.token);

            if (!decoded || !decoded.exp) {
                return; // Invalid token, nothing to revoke
            }

            // Calculate TTL: time until token expires
            const now = Math.floor(Date.now() / 1000);
            const ttl = decoded.exp - now;

            // Only blacklist if token hasn't expired yet
            if (ttl > 0) {
                await this.tokenBlacklistService.add(input.token, ttl);
            }
        } catch (error) {
            // Log error but don't throw - revocation failure shouldn't break the flow
            console.error('Error revoking token:', error);
        }
    }
}
