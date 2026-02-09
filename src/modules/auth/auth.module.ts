// ===========================================
// MODULES - Auth Module
// Wires dependencies via DI
// ===========================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from '../../interfaces/http/auth/auth.controller';
import { JwtStrategy } from './jwt.strategy';

// Ports
import { USER_REPOSITORY } from '../../application/ports';
import { TOKEN_SERVICE } from '../../application/ports/services/token.service.port';
import { PASSWORD_SERVICE } from '../../application/ports/services/password.service.port';
import { TOKEN_BLACKLIST_SERVICE } from '../../application/ports/services/token-blacklist.service.port';

// Infrastructure implementations
import { UserRepository } from '../../infrastructure/repositories';
import { JwtTokenService, BcryptPasswordService, RedisTokenBlacklistService } from '../../infrastructure/auth';
import { RedisService } from '../../infrastructure/redis/redis.service';

// Use cases
import {
    LoginUseCase,
    RegisterUseCase,
    LogoutUseCase,
    ValidateUserUseCase,
    CheckTokenRevokedUseCase,
} from '../../application/use-cases/auth';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<string>('jwt.expiresIn'),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        // Use Cases
        LoginUseCase,
        RegisterUseCase,
        LogoutUseCase,
        ValidateUserUseCase,
        CheckTokenRevokedUseCase,

        // Strategy
        JwtStrategy,

        // Infrastructure
        RedisService,

        // Repository implementations
        { provide: USER_REPOSITORY, useClass: UserRepository },

        // Service implementations
        { provide: TOKEN_SERVICE, useClass: JwtTokenService },
        { provide: PASSWORD_SERVICE, useClass: BcryptPasswordService },
        { provide: TOKEN_BLACKLIST_SERVICE, useClass: RedisTokenBlacklistService },
    ],
    exports: [
        JwtStrategy,
        PassportModule,
        ValidateUserUseCase,
        CheckTokenRevokedUseCase,
        LogoutUseCase,
        TOKEN_SERVICE,
        TOKEN_BLACKLIST_SERVICE,
    ],
})
export class AuthModule { }
