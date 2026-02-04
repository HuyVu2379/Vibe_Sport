// ===========================================
// REVIEWS SERVICE
// ===========================================

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewRepository, CreateReviewDto, ReviewWithUser } from '../../infrastructure/repositories/review.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Review } from '../../domain/entities/review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewRepository: ReviewRepository,
        private readonly prisma: PrismaService,
    ) { }

    async createReview(
        userId: string,
        bookingId: string,
        rating: number,
        comment?: string,
    ): Promise<Review> {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        // Check if booking exists and is completed
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { court: { include: { venue: true } } },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.userId !== userId) {
            throw new ForbiddenException('You can only review your own bookings');
        }

        if (booking.status !== 'COMPLETED') {
            throw new BadRequestException('You can only review completed bookings');
        }

        // Check if already reviewed
        const existingReview = await this.reviewRepository.findByBookingId(bookingId);
        if (existingReview) {
            throw new BadRequestException('Booking already reviewed');
        }

        // Create review
        const review = await this.reviewRepository.create({
            bookingId,
            venueId: booking.court.venue.id,
            userId,
            rating,
            comment,
        });

        // Update venue average rating
        await this.reviewRepository.updateVenueRating(booking.court.venue.id);

        return review;
    }

    async getVenueReviews(
        venueId: string,
        page = 0,
        size = 10,
    ): Promise<{ items: ReviewWithUser[]; total: number; averageRating: number }> {
        const [reviewsData, averageRating] = await Promise.all([
            this.reviewRepository.findByVenueId(venueId, page, size),
            this.reviewRepository.calculateVenueAverageRating(venueId),
        ]);

        return {
            ...reviewsData,
            averageRating,
        };
    }

    async addOwnerReply(
        ownerId: string,
        reviewId: string,
        reply: string,
    ): Promise<Review> {
        const review = await this.reviewRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Verify owner owns the venue
        const venue = await this.prisma.venue.findUnique({
            where: { id: review.venueId },
        });

        if (!venue || venue.ownerId !== ownerId) {
            throw new ForbiddenException('You can only reply to reviews of your venues');
        }

        if (review.reply) {
            throw new BadRequestException('Review already has a reply');
        }

        return this.reviewRepository.addReply(reviewId, reply);
    }

    async getReviewById(reviewId: string): Promise<Review | null> {
        return this.reviewRepository.findById(reviewId);
    }
}
