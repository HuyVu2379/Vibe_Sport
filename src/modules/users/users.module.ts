// ===========================================
// MODULES - Users Module
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { UsersController } from '../../interfaces/http/users/users.controller';
import { AuthModule } from '../auth/auth.module';

// Ports
import {
    USER_REPOSITORY,
    PASSWORD_HASH_SERVICE,
    OTP_SERVICE,
    EMAIL_SERVICE,
} from '../../application/ports';
import { TOKEN_BLACKLIST_SERVICE } from '../../application/ports/services/token-blacklist.service.port';
import { TOKEN_SERVICE } from '../../application/ports/services/token.service.port';

// Use cases
import { UpdateProfileUseCase } from '../../application/use-cases/users';
import {
    ChangePasswordUseCase,
    RequestPasswordResetUseCase,
    VerifyOtpAndResetPasswordUseCase,
} from '../../application/use-cases/password';

// Infrastructure
import { UserRepository } from '../../infrastructure/repositories';
import { OtpService } from '../../infrastructure/otp/otp.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { BcryptPasswordHashService } from '../../infrastructure/services/bcrypt-password-hash.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [UsersController],
    providers: [
        // Use cases
        UpdateProfileUseCase,
        ChangePasswordUseCase,
        RequestPasswordResetUseCase,
        VerifyOtpAndResetPasswordUseCase,

        // Repository implementations
        { provide: USER_REPOSITORY, useClass: UserRepository },

        // Service implementations
        { provide: PASSWORD_HASH_SERVICE, useClass: BcryptPasswordHashService },
        { provide: OTP_SERVICE, useClass: OtpService },
        { provide: EMAIL_SERVICE, useClass: EmailService },

        // Supporting infrastructure
        RedisService,
    ],
    exports: [USER_REPOSITORY],
})
export class UsersModule { }
