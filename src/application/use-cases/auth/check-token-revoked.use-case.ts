// ===========================================
// APPLICATION LAYER - Check Token Revoked Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { ITokenBlacklistService, TOKEN_BLACKLIST_SERVICE } from '../../ports/services/token-blacklist.service.port';

export interface CheckTokenRevokedInput {
    token: string;
}

@Injectable()
export class CheckTokenRevokedUseCase {
    constructor(
        @Inject(TOKEN_BLACKLIST_SERVICE)
        private readonly tokenBlacklistService: ITokenBlacklistService,
    ) { }

    /**
     * Check if a token has been revoked
     * @returns true if token is blacklisted, false otherwise
     */
    async execute(input: CheckTokenRevokedInput): Promise<boolean> {
        return this.tokenBlacklistService.isBlacklisted(input.token);
    }
}
