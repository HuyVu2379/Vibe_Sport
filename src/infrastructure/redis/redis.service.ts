import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
    private readonly logger = new Logger(RedisService.name);
    private readonly client: Redis;

    constructor(private readonly configService: ConfigService) {
        const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
        const token = this.configService.get<string>('UPSTASH_REDIS_TOKEN');

        if (!url || !token) {
            throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_TOKEN must be set');
        }

        this.client = new Redis({
            url,
            token,
        });
    }

    async onModuleInit() {
        try {
            // Test connection
            await this.client.ping();
            this.logger.log('Upstash Redis connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to Upstash Redis', error);
            throw error;
        }
    }

    getClient(): Redis {
        return this.client;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get<string>(key);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    /**
     * SET key value EX ttl NX - returns true if set, false if key exists
     * Used for concurrency control (HOLD mechanism)
     */
    async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
        const result = await this.client.set(key, value, {
            ex: ttlSeconds,
            nx: true,
        });
        return result === 'OK';
    }

    async ttl(key: string): Promise<number> {
        return this.client.ttl(key);
    }

    /**
     * Increment a key value by 1
     */
    async incr(key: string): Promise<number> {
        return this.client.incr(key);
    }

    /**
     * Set expiration time for a key
     */
    async expire(key: string, seconds: number): Promise<boolean> {
        const result = await this.client.expire(key, seconds);
        return result === 1;
    }
}
