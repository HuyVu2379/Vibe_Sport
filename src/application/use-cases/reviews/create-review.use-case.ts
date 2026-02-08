// ===========================================
// APPLICATION LAYER - Create Review Use Case
// ===========================================

import { Inject, Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../ports/review.repository.port';
import { IBookingRepository, BOOKING_REPOSITORY } from '../../ports/booking.repository.port';
import { Review } from '../../../domain/entities/review.entity';

export interface CreateReviewInput {
    userId: string;
    bookingId: string;
    rating: number;
    comment?: string;
}

@Injectable()
export class CreateReviewUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: IReviewRepository,
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
    ) { }

    async execute(input: CreateReviewInput): Promise<Review> {
        const { userId, bookingId, rating, comment } = input;

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        // Check if booking exists and is completed
        const booking = await this.bookingRepository.findByIdWithVenue(bookingId);

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
            venueId: booking.venueId,
            userId,
            rating,
            comment,
        });

        // Update venue average rating
        await this.reviewRepository.updateVenueRating(booking.venueId);

        return review;
    }
}
