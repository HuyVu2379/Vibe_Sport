// ===========================================
// INTERFACES LAYER - Auth DTOs
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'Phone or email' })
    @IsString()
    phoneOrEmail: string;

    @ApiProperty({ example: 'password123', description: 'Password or OTP' })
    @IsString()
    otpOrPassword: string;
}

export class UserResponseDto {
    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 'CUSTOMER' })
    role: string;
}

export class LoginResponseDto {
    @ApiProperty({ example: 'jwt.token.here' })
    token: string;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}

export class RegisterResponseDto {
    @ApiProperty({ example: 'jwt.token.here' })
    token: string;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}

export class RegisterDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    fullName: string
    @ApiProperty({ example: 'user@example.com' })
    @IsString()
    email: string
    @ApiProperty({ example: '0123456789' })
    @IsString()
    phone: string
    @ApiProperty({ example: 'CUSTOMER' })
    @IsString()
    role: string
    @ApiProperty({ example: 'password123' })
    @IsString()
    password: string
}
