// ===========================================
// INTERFACES LAYER - Auth Controller
// ===========================================

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../../modules/auth/auth.service';
import { Public } from '../../decorators/public.decorator';

import { LoginDto, LoginResponseDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Rate limit: 5 per minute
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, type: LoginResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        const result = await this.authService.login({
            phoneOrEmail: dto.phoneOrEmail,
            password: dto.otpOrPassword,
        });

        return {
            token: result.token,
            user: {
                userId: result.user.userId,
                role: result.user.role,
            },
        };
    }
}
