// ===========================================
// INTERFACES LAYER - Booking DTOs
// Based on API Contract v1.0
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsDateString,
    IsOptional,
    IsEnum,
    IsNumber,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';

// ===========================================
// Request DTOs
// ===========================================

export class CreateHoldDto {
    @ApiProperty({ example: 'uuid', description: 'Court ID' })
    @IsUUID()
    courtId: string;

    @ApiProperty({ example: '2026-01-10T18:00:00Z', description: 'Start time (ISO 8601)' })
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: '2026-01-10T19:00:00Z', description: 'End time (ISO 8601)' })
    @IsDateString()
    endTime: string;
}

export class ConfirmBookingDto {
    @ApiPropertyOptional({ example: 'Special request', description: 'Optional note' })
    @IsOptional()
    @IsString()
    note?: string;
}

export class CancelBookingDto {
    @ApiProperty({ example: 'Cannot attend', description: 'Cancellation reason' })
    @IsString()
    reason: string;
}

export class GetMyBookingsQueryDto {
    @ApiPropertyOptional({ enum: BookingStatus, description: 'Filter by status' })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({ example: '2026-01-01', description: 'From date' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ example: '2026-01-31', description: 'To date' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ example: 0, description: 'Page number (0-based)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    page?: number;

    @ApiPropertyOptional({ example: 10, description: 'Page size' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    size?: number;
}

// ===========================================
// Response DTOs
// ===========================================

export class HoldResponseDto {
    @ApiProperty({ example: 'uuid' })
    bookingId: string;

    @ApiProperty({ enum: BookingStatus, example: BookingStatus.HOLD })
    status: BookingStatus;

    @ApiProperty({ example: '2026-01-10T17:05:00Z' })
    holdExpiresAt: string;

    @ApiProperty({ example: 200000 })
    totalPrice: number;
}

export class ConfirmResponseDto {
    @ApiProperty({ example: 'uuid' })
    bookingId: string;

    @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
    status: BookingStatus;

    @ApiProperty({ example: 'uuid' })
    courtId: string;

    @ApiProperty({ example: '2026-01-10T18:00:00Z' })
    startTime: string;

    @ApiProperty({ example: '2026-01-10T19:00:00Z' })
    endTime: string;

    @ApiProperty({ example: 200000 })
    totalPrice: number;
}

export class CancelResponseDto {
    @ApiProperty({ example: 'uuid' })
    bookingId: string;

    @ApiProperty({ enum: BookingStatus, example: BookingStatus.CANCELLED_BY_USER })
    status: BookingStatus;
}

export class BookingItemDto {
    @ApiProperty({ example: 'uuid' })
    bookingId: string;

    @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
    status: BookingStatus;

    @ApiProperty({ example: 'uuid' })
    courtId: string;

    @ApiProperty({ example: '2026-01-10T18:00:00Z' })
    startTime: string;

    @ApiProperty({ example: '2026-01-10T19:00:00Z' })
    endTime: string;

    @ApiProperty({ example: 200000 })
    totalPrice?: number;

    @ApiProperty({ example: '2026-01-10T10:00:00Z' })
    createdAt?: string;
}

export class BookingsListResponseDto {
    @ApiProperty({ type: [BookingItemDto] })
    items: BookingItemDto[];

    @ApiProperty({ example: 0 })
    page: number;

    @ApiProperty({ example: 10 })
    size: number;

    @ApiProperty({ example: 1 })
    total: number;
}
