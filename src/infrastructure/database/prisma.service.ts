import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        // Prisma 7: pass database URL via driver adapter since `url` is removed from schema.prisma
        const adapter = new PrismaNeon({ connectionString: databaseUrl });
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


