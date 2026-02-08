// ===========================================
// INTERFACES LAYER - Reviews DTOs
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ example: 'Great venue!', description: 'Optional comment', required: false })
    @IsString()
    @IsOptional()
    comment?: string;
}

export class ReplyDto {
    @ApiProperty({ example: 'Thank you for your feedback!' })
    @IsString()
    reply: string;
}

export class ReviewUserDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'John Doe' })
    fullName: string;
}

export class ReviewResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    bookingId: string;

    @ApiProperty({ example: 'uuid' })
    venueId: string;

    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 5 })
    rating: number;

    @ApiProperty({ example: 'Great venue!', required: false })
    comment?: string;

    @ApiProperty({ example: 'Thank you!', required: false })
    reply?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ type: ReviewUserDto })
    user?: ReviewUserDto;
}

export class VenueReviewsResponseDto {
    @ApiProperty({ type: [ReviewResponseDto] })
    items: ReviewResponseDto[];

    @ApiProperty({ example: 10 })
    total: number;

    @ApiProperty({ example: 4.5 })
    averageRating: number;
}
