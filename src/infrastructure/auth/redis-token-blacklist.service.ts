// ===========================================
// INFRASTRUCTURE LAYER - Redis Token Blacklist Service
// Implements ITokenBlacklistService using Redis
// ===========================================

import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ITokenBlacklistService } from '../../application/ports/services/token-blacklist.service.port';

@Injectable()
export class RedisTokenBlacklistService implements ITokenBlacklistService {
    constructor(private readonly redisService: RedisService) { }

    /**
     * Build Redis key for token blacklist
     * Format: token:blacklist:{tokenHash}
     */
    private buildKey(token: string): string {
        // Use a proper SHA-256 hash of the full token to avoid collisions
        // The previous implementation using base64 substring only grabbed the JWT header (eyJhbGc...)
        // causing all tokens to share the same blacklist key.
        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        return `token:blacklist:${tokenHash}`;
    }

    async add(token: string, ttlSeconds: number): Promise<void> {
        try {
            const key = this.buildKey(token);
            await this.redisService.set(key, 'revoked', ttlSeconds);
        } catch (error) {
            // Log error but don't throw - revocation failure shouldn't break the flow
            console.error('Error blacklisting token:', error);
        }
    }

    async isBlacklisted(token: string): Promise<boolean> {
        try {
            const key = this.buildKey(token);
            return await this.redisService.exists(key);
        } catch (error) {
            console.error('Error checking token blacklist:', error);
            return false; // On error, assume token is not revoked
        }
    }
}
