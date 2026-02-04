// ===========================================
// REVIEWS MODULE
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ReviewRepository } from '../../infrastructure/repositories/review.repository';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
    imports: [PrismaModule],
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewRepository],
    exports: [ReviewsService, ReviewRepository],
})
export class ReviewsModule { }
