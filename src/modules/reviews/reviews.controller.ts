// ===========================================
// REVIEWS CONTROLLER
// ===========================================

import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { CurrentUser } from '../../interfaces/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
    rating: number;
    comment?: string;
}

class ReplyDto {
    reply: string;
}

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post('bookings/:bookingId/review')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a review for a completed booking' })
    async createReview(
        @CurrentUser('userId') userId: string,
        @Param('bookingId') bookingId: string,
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewsService.createReview(userId, bookingId, dto.rating, dto.comment);
    }

    @Get('venues/:venueId/reviews')
    @ApiOperation({ summary: 'Get reviews for a venue' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    async getVenueReviews(
        @Param('venueId') venueId: string,
        @Query('page') page = 0,
        @Query('size') size = 10,
    ) {
        return this.reviewsService.getVenueReviews(venueId, Number(page), Number(size));
    }

    @Patch('reviews/:reviewId/reply')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add owner reply to a review' })
    async addReply(
        @CurrentUser('userId') ownerId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReplyDto,
    ) {
        return this.reviewsService.addOwnerReply(ownerId, reviewId, dto.reply);
    }

    @Get('reviews/:reviewId')
    @ApiOperation({ summary: 'Get a review by ID' })
    async getReview(@Param('reviewId') reviewId: string) {
        return this.reviewsService.getReviewById(reviewId);
    }
}
