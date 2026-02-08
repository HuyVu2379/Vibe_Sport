// ===========================================
// APPLICATION LAYER - Review Repository Port
// ===========================================

import { Review } from '../../domain/entities/review.entity';

export interface CreateReviewData {
    bookingId: string;
    venueId: string;
    userId: string;
    rating: number;
    comment?: string;
}

export interface ReviewWithUser extends Review {
    user: {
        id: string;
        fullName: string;
    };
}

export interface IReviewRepository {
    create(data: CreateReviewData): Promise<Review>;
    findById(id: string): Promise<Review | null>;
    findByBookingId(bookingId: string): Promise<Review | null>;
    findByVenueId(venueId: string, page: number, size: number): Promise<{ items: ReviewWithUser[]; total: number }>;
    addReply(reviewId: string, reply: string): Promise<Review>;
    calculateVenueAverageRating(venueId: string): Promise<number>;
    updateVenueRating(venueId: string): Promise<void>;
}

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');
