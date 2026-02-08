// ===========================================
// APPLICATION LAYER - Add Owner Reply Use Case
// ===========================================

import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../ports/review.repository.port';
import { IVenueRepository, VENUE_REPOSITORY } from '../../ports/venue.repository.port';
import { Review } from '../../../domain/entities/review.entity';

export interface AddOwnerReplyInput {
    ownerId: string;
    reviewId: string;
    reply: string;
}

@Injectable()
export class AddOwnerReplyUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: IReviewRepository,
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async execute(input: AddOwnerReplyInput): Promise<Review> {
        const { ownerId, reviewId, reply } = input;

        const review = await this.reviewRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Verify owner owns the venue
        const venue = await this.venueRepository.findById(review.venueId);

        if (!venue || venue.ownerId !== ownerId) {
            throw new ForbiddenException('You can only reply to reviews of your venues');
        }

        if (review.reply) {
            throw new BadRequestException('Review already has a reply');
        }

        return this.reviewRepository.addReply(reviewId, reply);
    }
}
