// ===========================================
// INFRASTRUCTURE LAYER - Hold Service
// Redis implementation for slot locking
// ===========================================

import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { IHoldService, HoldData } from '../../application/ports/hold.service.port';

@Injectable()
export class HoldService implements IHoldService {
    private readonly KEY_PREFIX = 'hold';

    constructor(private readonly redisService: RedisService) { }

    private buildKey(courtId: string, startTime: Date, endTime: Date): string {
        const start = startTime.toISOString();
        const end = endTime.toISOString();
        return `${this.KEY_PREFIX}:${courtId}:${start}:${end}`;
    }

    async acquireHold(
        courtId: string,
        startTime: Date,
        endTime: Date,
        data: HoldData,
        ttlSeconds: number,
    ): Promise<boolean> {
        const key = this.buildKey(courtId, startTime, endTime);
        const value = JSON.stringify(data);

        // SET NX ensures only first caller wins
        return this.redisService.setNx(key, value, ttlSeconds);
    }

    async updateHold(
        courtId: string,
        startTime: Date,
        endTime: Date,
        data: HoldData,
        ttlSeconds: number,
    ): Promise<void> {
        const key = this.buildKey(courtId, startTime, endTime);
        const value = JSON.stringify(data);
        await this.redisService.set(key, value, ttlSeconds);
    }

    async releaseHold(courtId: string, startTime: Date, endTime: Date): Promise<void> {
        const key = this.buildKey(courtId, startTime, endTime);
        await this.redisService.del(key);
    }

    async isHeld(courtId: string, startTime: Date, endTime: Date): Promise<boolean> {
        const key = this.buildKey(courtId, startTime, endTime);
        return this.redisService.exists(key);
    }

    async getHoldData(
        courtId: string,
        startTime: Date,
        endTime: Date,
    ): Promise<HoldData | null> {
        const key = this.buildKey(courtId, startTime, endTime);
        const value = await this.redisService.get(key);

        if (!value) return null;

        try {
            return JSON.parse(value) as HoldData;
        } catch {
            return null;
        }
    }

    async getHoldTtl(courtId: string, startTime: Date, endTime: Date): Promise<number> {
        const key = this.buildKey(courtId, startTime, endTime);
        return this.redisService.ttl(key);
    }
}
