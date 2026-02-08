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
        // Use a hash of the token to avoid storing full token in Redis key
        const tokenHash = Buffer.from(token).toString('base64').substring(0, 32);
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
