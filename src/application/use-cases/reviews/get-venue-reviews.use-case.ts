// ===========================================
// APPLICATION LAYER - Get Venue Reviews Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IReviewRepository, REVIEW_REPOSITORY, ReviewWithUser } from '../../ports/review.repository.port';

export interface GetVenueReviewsInput {
    venueId: string;
    page?: number;
    size?: number;
}

export interface GetVenueReviewsOutput {
    items: ReviewWithUser[];
    total: number;
    averageRating: number;
}

@Injectable()
export class GetVenueReviewsUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: IReviewRepository,
    ) { }

    async execute(input: GetVenueReviewsInput): Promise<GetVenueReviewsOutput> {
        const { venueId, page = 0, size = 10 } = input;

        const [reviewsData, averageRating] = await Promise.all([
            this.reviewRepository.findByVenueId(venueId, page, size),
            this.reviewRepository.calculateVenueAverageRating(venueId),
        ]);

        return {
            ...reviewsData,
            averageRating,
        };
    }
}
