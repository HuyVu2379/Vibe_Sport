// ===========================================
// INTERFACES LAYER - Venues DTOs
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchVenuesQueryDto {
    @ApiPropertyOptional({ example: 10.762622, description: 'Latitude' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lat?: number;

    @ApiPropertyOptional({ example: 106.660172, description: 'Longitude' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lng?: number;

    @ApiPropertyOptional({ example: 10, description: 'Radius in km' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    radiusKm?: number;

    @ApiPropertyOptional({ example: 'FOOTBALL', description: 'Sport type' })
    @IsOptional()
    @IsString()
    sportType?: string;

    @ApiPropertyOptional({ example: 'sân', description: 'Search query' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ example: 0, description: 'Page number' })
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

export class VenueListItemDto {
    @ApiProperty({ example: 'uuid' })
    venueId: string;

    @ApiProperty({ example: 'Sân ABC' })
    name: string;

    @ApiProperty({ example: '123 Street, District' })
    address: string;

    @ApiProperty({ example: 10.762622 })
    lat: number;

    @ApiProperty({ example: 106.660172 })
    lng: number;

    @ApiPropertyOptional({ example: 2.4 })
    distanceKm?: number;

    @ApiProperty({ example: ['FOOTBALL'] })
    sportTypes: string[];
}

export class VenueListResponseDto {
    @ApiProperty({ type: [VenueListItemDto] })
    items: VenueListItemDto[];

    @ApiProperty({ example: 0 })
    page: number;

    @ApiProperty({ example: 10 })
    size: number;

    @ApiProperty({ example: 1 })
    total: number;
}

export class CourtItemDto {
    @ApiProperty({ example: 'uuid' })
    courtId: string;

    @ApiProperty({ example: 'Sân 1' })
    name: string;

    @ApiProperty({ example: 'FOOTBALL' })
    sportType: string;
}

export class VenueDetailResponseDto {
    @ApiProperty({ example: 'uuid' })
    venueId: string;

    @ApiProperty({ example: 'Sân ABC' })
    name: string;

    @ApiProperty({ example: '123 Street, District' })
    address: string;

    @ApiProperty({ example: 10.762622 })
    lat: number;

    @ApiProperty({ example: 106.660172 })
    lng: number;

    @ApiProperty({ type: [CourtItemDto] })
    courts: CourtItemDto[];
}
