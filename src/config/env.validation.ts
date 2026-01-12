import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, Min, IsOptional } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    @Min(1)
    PORT: number;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    UPSTASH_REDIS_REST_URL: string;

    @IsString()
    UPSTASH_REDIS_TOKEN: string;

    @IsString()
    @IsOptional()
    UPSTASH_REDIS_READONLY_TOKEN: string;

    @IsString()
    JWT_SECRET: string;

    @IsString()
    JWT_EXPIRES_IN: string;

    @IsNumber()
    @Min(1)
    HOLD_TTL_MINUTES: number;

    @IsNumber()
    @Min(1000)
    THROTTLE_TTL: number;

    @IsNumber()
    @Min(1)
    THROTTLE_LIMIT: number;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
