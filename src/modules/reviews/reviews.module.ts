// ===========================================
// MODULES - Reviews Module
// Wires dependencies via DI
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

import { ReviewsController } from '../../interfaces/http/reviews/reviews.controller';

// Ports
import { REVIEW_REPOSITORY } from '../../application/ports/review.repository.port';
import { BOOKING_REPOSITORY } from '../../application/ports/booking.repository.port';
import { VENUE_REPOSITORY } from '../../application/ports/venue.repository.port';

// Infrastructure implementations
import { ReviewRepository } from '../../infrastructure/repositories/review.repository';
import { BookingRepository } from '../../infrastructure/repositories/booking.repository';
import { VenueRepository } from '../../infrastructure/repositories/venue.repository';

// Use cases
import {
    CreateReviewUseCase,
    GetVenueReviewsUseCase,
    AddOwnerReplyUseCase,
    GetReviewUseCase,
} from '../../application/use-cases/reviews';

@Module({
    imports: [PrismaModule],
    controllers: [ReviewsController],
    providers: [
        // Use Cases
        CreateReviewUseCase,
        GetVenueReviewsUseCase,
        AddOwnerReplyUseCase,
        GetReviewUseCase,

        // Repository implementations
        { provide: REVIEW_REPOSITORY, useClass: ReviewRepository },
        { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
    ],
    exports: [
        CreateReviewUseCase,
        GetVenueReviewsUseCase,
    ],
})
export class ReviewsModule { }
