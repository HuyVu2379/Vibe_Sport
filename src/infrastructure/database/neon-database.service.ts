import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

@Injectable()
export class NeonDatabaseService implements OnModuleInit {
    private readonly logger = new Logger(NeonDatabaseService.name);
    private sql: NeonQueryFunction<false, false>;

    constructor(private readonly configService: ConfigService) {
        const databaseUrl = this.configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        this.sql = neon(databaseUrl);
    }

    async onModuleInit() {
        try {
            // Test connection
            await this.sql`SELECT 1 as connected`;
            this.logger.log('Neon Database connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to Neon Database', error);
            throw error;
        }
    }

    /**
     * Get the Neon SQL client for raw queries
     * Usage: const data = await neonService.query`SELECT * FROM users WHERE id = ${userId}`;
     */
    get query(): NeonQueryFunction<false, false> {
        return this.sql;
    }

    /**
     * Execute a tagged template query
     * @example
     * const users = await neonService.execute`SELECT * FROM users WHERE role = ${role}`;
     */
    execute<T = Record<string, unknown>>(
        strings: TemplateStringsArray,
        ...values: unknown[]
    ): Promise<T[]> {
        return this.sql(strings, ...values) as unknown as Promise<T[]>;
    }
}
