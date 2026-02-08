// ===========================================
// INTERFACES LAYER - Users Controller
// ===========================================

import { Controller, Post, Body, Req, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { PasswordService } from '../../../modules/users/password.service';
import { UsersService } from '@/modules/users/users.service';
import { AuthService } from '../../../modules/auth/auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';
import {
    ChangePasswordDto,
    ForgotPasswordRequestDto,
    ForgotPasswordVerifyDto,
    UpdateProfileDto,
    SuccessResponseDto,
} from './users.dto';

/**
 * UsersController handles user account management endpoints
 * 
 * Endpoints:
 * - POST /users/change-password - Change password for authenticated users
 * - POST /users/forgot-password/request - Request OTP for password reset
 * - POST /users/forgot-password/verify - Verify OTP and reset password
 * - POST /users/logout - Logout and invalidate current token
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly passwordService: PasswordService,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    /**
     * Update user profile (fullName and avatarUrl)
     * 
     * Requirements:
     * - Valid JWT token (user must be logged in)
     * - At least one field (fullName or avatarUrl) must be provided
     * 
     * Side effects:
     * - Updates user profile in database
     */
    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update user profile',
        description: 'Update fullName and/or avatarUrl for the authenticated user. At least one field must be provided.',
    })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDto,
        description: 'Profile updated successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Validation error or no fields provided',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    async updateProfile(
        @Req() req: Request,
        @Body() dto: UpdateProfileDto,
    ): Promise<SuccessResponseDto> {
        // Extract user ID from JWT payload (set by JwtAuthGuard)
        const userId = (req.user as any).userId;

        await this.usersService.updateProfile(userId, dto);

        return new SuccessResponseDto('Profile updated successfully');
    }

    /**
     * Change password for authenticated user
     * 
     * Requirements:
     * - Valid JWT token (user must be logged in)
     * - Old password must be correct
     * - New password must meet validation requirements
     * 
     * Side effects:
     * - Updates password in database
     * - Revokes current JWT token (forces logout)
     * - Sends email notification
     */
    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Change password',
        description: 'Change password for the authenticated user. Requires valid JWT. All active sessions will be invalidated.',
    })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDto,
        description: 'Password changed successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid old password or validation error',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    async changePassword(
        @Req() req: Request,
        @Body() dto: ChangePasswordDto,
    ): Promise<SuccessResponseDto> {
        // Extract user ID from JWT payload (set by JwtAuthGuard)
        const userId = (req.user as any).userId;

        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '') || '';

        await this.passwordService.changePassword(
            userId,
            dto.oldPassword,
            dto.newPassword,
            token,
        );

        return new SuccessResponseDto('Password changed successfully. Please login again.');
    }

    /**
     * Request OTP for password reset
     * 
     * Security note: Always returns success, even if user doesn't exist.
     * This prevents enumeration attacks.
     * 
     * Rate limited to prevent abuse.
     */
    @Post('forgot-password/request')
    @Public()
    @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
    @ApiOperation({
        summary: 'Request password reset OTP',
        description: 'Request an OTP for password reset. OTP will be sent to the user\'s email. Always returns success for security reasons.',
    })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDto,
        description: 'OTP sent successfully (if user exists)',
    })
    @ApiResponse({
        status: 429,
        description: 'Too many requests - Rate limit exceeded',
    })
    async requestPasswordReset(
        @Body() dto: ForgotPasswordRequestDto,
    ): Promise<SuccessResponseDto> {
        await this.passwordService.requestPasswordReset(dto.emailOrPhone);

        // Always return success, even if user doesn't exist (security measure)
        return new SuccessResponseDto(
            'If an account with that email or phone exists, an OTP has been sent. Please check your email.',
        );
    }

    /**
     * Verify OTP and reset password
     * 
     * Validates OTP and sets new password.
     * Rate limited to prevent brute force attacks.
     */
    @Post('forgot-password/verify')
    @Public()
    @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
    @ApiOperation({
        summary: 'Verify OTP and reset password',
        description: 'Verify the OTP and set a new password. OTP must be valid and not expired.',
    })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDto,
        description: 'Password reset successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired OTP, or validation error',
    })
    @ApiResponse({
        status: 429,
        description: 'Too many requests - Rate limit exceeded',
    })
    async verifyOtpAndResetPassword(
        @Body() dto: ForgotPasswordVerifyDto,
    ): Promise<SuccessResponseDto> {
        await this.passwordService.verifyOtpAndResetPassword(
            dto.emailOrPhone,
            dto.otp,
            dto.newPassword,
        );

        return new SuccessResponseDto('Password reset successfully. You can now login with your new password.');
    }

    /**
     * Logout current session
     * 
     * Invalidates the current JWT token by adding it to Redis blacklist.
     * The token will remain blacklisted until its natural expiration.
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Logout',
        description: 'Logout the current session by revoking the JWT token.',
    })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDto,
        description: 'Logged out successfully',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    async logout(@Req() req: Request): Promise<SuccessResponseDto> {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '') || '';

        // Revoke token
        await this.authService.revokeToken(token);

        return new SuccessResponseDto('Logged out successfully');
    }
}
