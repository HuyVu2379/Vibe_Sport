// ===========================================
// INTERFACES LAYER - Availability DTOs
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetAvailabilityQueryDto {
    @ApiProperty({ example: '2026-01-10', description: 'Date (YYYY-MM-DD)' })
    @IsDateString()
    date: string;
}

export class SlotDto {
    @ApiProperty({ example: '2026-01-10T18:00:00Z' })
    startTime: string;

    @ApiProperty({ example: '2026-01-10T19:00:00Z' })
    endTime: string;

    @ApiProperty({ enum: ['AVAILABLE', 'UNAVAILABLE'], example: 'AVAILABLE' })
    status: 'AVAILABLE' | 'UNAVAILABLE';

    @ApiPropertyOptional({ example: 200000 })
    price?: number;
}

export class AvailabilityResponseDto {
    @ApiProperty({ example: 'uuid' })
    courtId: string;

    @ApiProperty({ example: '2026-01-10' })
    date: string;

    @ApiProperty({ type: [SlotDto] })
    slots: SlotDto[];
}
