// ===========================================
// APPLICATION LAYER - Get Review Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../ports/review.repository.port';
import { Review } from '../../../domain/entities/review.entity';

export interface GetReviewInput {
    reviewId: string;
}

@Injectable()
export class GetReviewUseCase {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly reviewRepository: IReviewRepository,
    ) { }

    async execute(input: GetReviewInput): Promise<Review | null> {
        return this.reviewRepository.findById(input.reviewId);
    }
}
