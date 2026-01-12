// ===========================================
// INTERFACES LAYER - Owner DTOs
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsUUID,
    IsOptional,
    IsEnum,
    IsNumber,
    IsDateString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';

export class GetOwnerBookingsQueryDto {
    @ApiPropertyOptional({ example: '2026-01-01', description: 'From date' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ example: '2026-01-31', description: 'To date' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ example: 'uuid', description: 'Filter by court ID' })
    @IsOptional()
    @IsUUID()
    courtId?: string;

    @ApiPropertyOptional({ enum: BookingStatus, description: 'Filter by status' })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

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

export class OwnerCancelBookingDto {
    @ApiProperty({ example: 'Court maintenance', description: 'Cancellation reason' })
    @IsString()
    reason: string;
}

export class CustomerInfoDto {
    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 'John Doe' })
    fullName: string;

    @ApiPropertyOptional({ example: '0912345678' })
    phone?: string;
}

export class OwnerBookingItemDto {
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

    @ApiProperty({ type: CustomerInfoDto })
    customer: CustomerInfoDto;
}

export class OwnerBookingsListResponseDto {
    @ApiProperty({ type: [OwnerBookingItemDto] })
    items: OwnerBookingItemDto[];

    @ApiProperty({ example: 0 })
    page: number;

    @ApiProperty({ example: 10 })
    size: number;

    @ApiProperty({ example: 1 })
    total: number;
}

export class CancelResponseDto {
    @ApiProperty({ example: 'uuid' })
    bookingId: string;

    @ApiProperty({ enum: BookingStatus, example: BookingStatus.CANCELLED_BY_OWNER })
    status: BookingStatus;
}
