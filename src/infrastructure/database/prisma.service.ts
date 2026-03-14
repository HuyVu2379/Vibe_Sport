import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        // Prisma 7: `@prisma/adapter-neon` now expects a PoolConfig object, instead of a Pool instance.
        const poolConfig = { connectionString: databaseUrl };
        const adapter = new PrismaNeon(poolConfig);
        super({ adapter } as any);
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}


