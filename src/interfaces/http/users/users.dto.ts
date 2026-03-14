// ===========================================
// INTERFACES LAYER - Users DTOs
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches, Length, IsNumberString, IsOptional, IsUrl } from 'class-validator';

/**
 * DTO for updating user profile
 */
export class UpdateProfileDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'User full name',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Full name cannot be empty' })
    fullName?: string;

    @ApiProperty({
        example: '0123456789',
        description: 'User phone number',
        required: false,
    })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({
        example: 'https://example.com/avatar.jpg',
        description: 'User avatar URL',
        required: false,
    })
    @IsOptional()
    @IsString()
    avatarUrl?: string;
}

/**
 * DTO for changing password (authenticated users)
 */
export class ChangePasswordDto {
    @ApiProperty({
        example: 'oldPassword123',
        description: 'Current password',
        minLength: 6,
    })
    @IsString()
    @MinLength(6, { message: 'Old password must be at least 6 characters long' })
    oldPassword: string;

    @ApiProperty({
        example: 'NewSecureP@ss123',
        description: 'New password (min 6 characters, should contain uppercase, lowercase, number, and special character)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    newPassword: string;
}

/**
 * DTO for requesting password reset OTP
 */
export class ForgotPasswordRequestDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email or phone number',
    })
    @IsString()
    emailOrPhone: string;
}

/**
 * DTO for verifying OTP and resetting password
 */
export class ForgotPasswordVerifyDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email or phone number',
    })
    @IsString()
    emailOrPhone: string;

    @ApiProperty({
        example: '123456',
        description: '6-digit OTP code',
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    @IsNumberString({}, { message: 'OTP must contain only numbers' })
    otp: string;

    @ApiProperty({
        example: 'NewSecureP@ss123',
        description: 'New password (min 6 characters, should contain uppercase, lowercase, number, and special character)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    newPassword: string;
}

/**
 * Generic success response DTO
 */
export class SuccessResponseDto {
    @ApiProperty({
        example: true,
        description: 'Indicates if the operation was successful',
    })
    success: boolean;

    @ApiProperty({
        example: 'Operation completed successfully',
        description: 'Success message',
    })
    message: string;

    constructor(message: string) {
        this.success = true;
        this.message = message;
    }
}

export class GetMeResponseDto {
    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 'CUSTOMER' })
    role: string;

    @ApiProperty({ example: 'John Doe' })
    fullName: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: '0123456789' })
    phone: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg' })
    avatarUrl: string;
}