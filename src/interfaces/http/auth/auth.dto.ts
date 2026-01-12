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
