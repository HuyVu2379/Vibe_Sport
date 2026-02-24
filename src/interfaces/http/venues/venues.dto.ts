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

    @ApiPropertyOptional({ example: 100000, description: 'Min price per hour' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({ example: 200000, description: 'Max price per hour' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

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

    @ApiProperty({ example: 1 })
    totalCourts: number;

    @ApiProperty({ example: 1 })
    totalReviews: number;

    @ApiProperty({ example: 1 })
    ratingAvg: number;

    @ApiProperty({ example: 100000 })
    minPricePerHour: number;

    @ApiProperty({ example: 'url1' })
    imageUrl: string;
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

    @ApiProperty({ example: 100000 })
    minPricePerHour: number;

    @ApiProperty({ example: ['url1', 'url2'] })
    imageUrls: string[];
}

export class Amentity {
    @ApiProperty({ example: 'uuid' })
    amenityId: string;

    @ApiProperty({ example: 'name' })
    name: string;

    @ApiProperty({ example: 'icon' })
    icon: string;
}

export class ReviewItemDto {
    @ApiProperty({ example: 'uuid' })
    reviewId: string;

    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 'name' })
    name: string;

    @ApiProperty({ example: 'avatar' })
    avatar: string;

    @ApiProperty({ example: 5 })
    rating: number;

    @ApiProperty({ example: 'comment' })
    comment: string;

    @ApiPropertyOptional({ example: 'reply' })
    reply?: string;

    @ApiProperty({ example: '2026-02-06' })
    createdAt: string;

    @ApiPropertyOptional({ example: '2026-02-06' })
    replyTime?: string;
}

export class Contact {
    @ApiProperty({ example: '0123456789' })
    phone: string;

    @ApiProperty({ example: 'example@gmail.com' })
    email: string;
}

export class Policy {
    @ApiProperty({ example: 'NONE' })
    depositType: string;

    @ApiProperty({ example: 10 })
    depositPercentage: number;

    @ApiProperty({ example: 24 })
    cancelBeforeHours: number;
}

export class OpenHour {
    @ApiProperty({ example: '2026-02-06' })
    dayOfWeek: string;

    @ApiProperty({ example: '08:00' })
    openTime: string;

    @ApiProperty({ example: '22:00' })
    closeTime: string;
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

    @ApiProperty({ example: ['url1', 'url2'] })
    imageUrls: string[];

    @ApiProperty({ example: 'About venue' })
    about: string;

    @ApiProperty({ type: [Amentity] })
    amenities: Amentity[];

    @ApiProperty({ example: 1 })
    totalReviews: number;

    @ApiProperty({ example: 1 })
    ratingAvg: number;

    @ApiProperty({ type: [OpenHour] })
    openHours: OpenHour[];

    @ApiProperty({ type: Contact })
    contact: Contact;

    @ApiProperty({ type: Policy })
    policy: Policy;

    @ApiProperty({ example: ['FOOTBALL'] })
    sportTypes: string[];
}

