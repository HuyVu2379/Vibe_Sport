// ===========================================
// INTERFACES LAYER - Users Controller
// ===========================================

import { Controller, Post, Body, Req, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';

// Use cases
import { UpdateProfileUseCase } from '../../../application/use-cases/users';
import { ChangePasswordUseCase } from '../../../application/use-cases/password/change-password.use-case';
import { RequestPasswordResetUseCase } from '../../../application/use-cases/password/request-password-reset.use-case';
import { VerifyOtpAndResetPasswordUseCase } from '../../../application/use-cases/password/verify-otp-reset-password.use-case';
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.use-case';

import {
    ChangePasswordDto,
    ForgotPasswordRequestDto,
    ForgotPasswordVerifyDto,
    UpdateProfileDto,
    SuccessResponseDto,
} from './users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
        private readonly verifyOtpAndResetPasswordUseCase: VerifyOtpAndResetPasswordUseCase,
        private readonly logoutUseCase: LogoutUseCase,
    ) { }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, type: SuccessResponseDto })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateProfile(
        @Req() req: any,
        @Body() dto: UpdateProfileDto,
    ): Promise<SuccessResponseDto> {
        const userId = req.user?.userId;
        await this.updateProfileUseCase.execute({
            userId,
            fullName: dto.fullName,
            avatarUrl: dto.avatarUrl,
        });
        return new SuccessResponseDto('Profile updated successfully');
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password' })
    @ApiResponse({ status: 200, type: SuccessResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid old password' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async changePassword(
        @Req() req: any,
        @Body() dto: ChangePasswordDto,
    ): Promise<SuccessResponseDto> {
        const userId = req.user?.userId;
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '') || '';

        await this.changePasswordUseCase.execute({
            userId,
            oldPassword: dto.oldPassword,
            newPassword: dto.newPassword,
            currentToken: token,
        });

        return new SuccessResponseDto('Password changed successfully. Please login again.');
    }

    @Post('forgot-password/request')
    @Public()
    @Throttle({ default: { limit: 3, ttl: 900000 } })
    @ApiOperation({ summary: 'Request password reset OTP' })
    @ApiResponse({ status: 200, type: SuccessResponseDto })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    async requestPasswordReset(
        @Body() dto: ForgotPasswordRequestDto,
    ): Promise<SuccessResponseDto> {
        await this.requestPasswordResetUseCase.execute({
            emailOrPhone: dto.emailOrPhone,
        });
        return new SuccessResponseDto(
            'If an account with that email or phone exists, an OTP has been sent.',
        );
    }

    @Post('forgot-password/verify')
    @Public()
    @Throttle({ default: { limit: 5, ttl: 900000 } })
    @ApiOperation({ summary: 'Verify OTP and reset password' })
    @ApiResponse({ status: 200, type: SuccessResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    async verifyOtpAndResetPassword(
        @Body() dto: ForgotPasswordVerifyDto,
    ): Promise<SuccessResponseDto> {
        await this.verifyOtpAndResetPasswordUseCase.execute({
            emailOrPhone: dto.emailOrPhone,
            otp: dto.otp,
            newPassword: dto.newPassword,
        });
        return new SuccessResponseDto('Password reset successfully.');
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 200, type: SuccessResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Req() req: Request): Promise<SuccessResponseDto> {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '') || '';
        await this.logoutUseCase.execute({ token });
        return new SuccessResponseDto('Logged out successfully');
    }
}
