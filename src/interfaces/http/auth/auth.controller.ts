// ===========================================
// INTERFACES LAYER - Auth Controller
// ===========================================

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../../modules/auth/auth.service';
import { Public } from '../../decorators/public.decorator';

import { LoginDto, LoginResponseDto, RegisterDto, RegisterResponseDto } from './auth.dto';

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

        return result;
    }

    @Post('register')
    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Rate limit: 5 per minute
    @ApiOperation({ summary: 'Register' })
    @ApiResponse({ status: 200, type: RegisterResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        const result = await this.authService.register(
            {
                email: dto.email,
                password: dto.password,
                fullName: dto.fullName,
                role: dto.role,
                phone: dto.phone,
            }
        );
        return result;
    }
}
