// ===========================================
// INTERFACES LAYER - Reviews Controller
// ===========================================

import { Controller, Post, Get, Param, Body, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

import { CreateReviewDto, ReplyDto, VenueReviewsResponseDto, ReviewResponseDto } from './reviews.dto';
import { CreateReviewUseCase } from '../../../application/use-cases/reviews/create-review.use-case';
import { GetVenueReviewsUseCase } from '../../../application/use-cases/reviews/get-venue-reviews.use-case';
import { AddOwnerReplyUseCase } from '../../../application/use-cases/reviews/add-owner-reply.use-case';
import { GetReviewUseCase } from '../../../application/use-cases/reviews/get-review.use-case';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
    constructor(
        private readonly createReviewUseCase: CreateReviewUseCase,
        private readonly getVenueReviewsUseCase: GetVenueReviewsUseCase,
        private readonly addOwnerReplyUseCase: AddOwnerReplyUseCase,
        private readonly getReviewUseCase: GetReviewUseCase,
    ) { }

    @Post('bookings/:bookingId/review')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a review for a booking' })
    @ApiResponse({ status: 201, type: ReviewResponseDto })
    async createReview(
        @CurrentUser('userId') userId: string,
        @Param('bookingId') bookingId: string,
        @Body() dto: CreateReviewDto,
    ) {
        return this.createReviewUseCase.execute({
            userId,
            bookingId,
            rating: dto.rating,
            comment: dto.comment,
        });
    }

    @Get('venues/:venueId/reviews')
    @ApiOperation({ summary: 'Get venue reviews' })
    @ApiResponse({ status: 200, type: VenueReviewsResponseDto })
    async getVenueReviews(
        @Param('venueId') venueId: string,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    ) {
        return this.getVenueReviewsUseCase.execute({ venueId, page, size });
    }

    @Post('reviews/:reviewId/reply')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Owner reply to a review' })
    @ApiResponse({ status: 200, type: ReviewResponseDto })
    async addReply(
        @CurrentUser('userId') ownerId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReplyDto,
    ) {
        return this.addOwnerReplyUseCase.execute({
            ownerId,
            reviewId,
            reply: dto.reply,
        });
    }

    @Get('reviews/:reviewId')
    @ApiOperation({ summary: 'Get a review by ID' })
    @ApiResponse({ status: 200, type: ReviewResponseDto })
    async getReview(@Param('reviewId') reviewId: string) {
        return this.getReviewUseCase.execute({ reviewId });
    }
}
