import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../application/ports';
import { UserRepository } from '../../infrastructure/repositories';
import { PasswordService } from './password.service';
import { UsersService } from './users.service';
import { OtpService } from '../../infrastructure/otp/otp.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from '../../interfaces/http/users/users.controller';

@Module({
    imports: [AuthModule], // Import AuthModule for AuthService
    controllers: [UsersController],
    providers: [
        { provide: USER_REPOSITORY, useClass: UserRepository },
        PasswordService,
        UsersService,
        OtpService,
        EmailService,
        RedisService,
    ],
    exports: [USER_REPOSITORY, PasswordService, UsersService],
})
export class UsersModule { }
