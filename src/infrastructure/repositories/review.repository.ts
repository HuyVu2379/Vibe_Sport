// ===========================================
// INFRASTRUCTURE - Review Repository
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Review } from '../../domain/entities/review.entity';
import {
    IReviewRepository,
    CreateReviewData,
    ReviewWithUser
} from '../../application/ports/review.repository.port';

@Injectable()
export class ReviewRepository implements IReviewRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateReviewData): Promise<Review> {
        const review = await this.prisma.review.create({
            data: {
                bookingId: data.bookingId,
                venueId: data.venueId,
                userId: data.userId,
                rating: data.rating,
                comment: data.comment || null,
            },
        });

        return this.mapToDomain(review);
    }

    async findById(id: string): Promise<Review | null> {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });

        return review ? this.mapToDomain(review) : null;
    }

    async findByBookingId(bookingId: string): Promise<Review | null> {
        const review = await this.prisma.review.findUnique({
            where: { bookingId },
        });

        return review ? this.mapToDomain(review) : null;
    }

    async findByVenueId(venueId: string, page = 0, size = 10): Promise<{ items: ReviewWithUser[]; total: number }> {
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { venueId },
                include: {
                    user: {
                        select: { id: true, fullName: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: page * size,
                take: size,
            }),
            this.prisma.review.count({ where: { venueId } }),
        ]);

        const items: ReviewWithUser[] = reviews.map((r) => {
            const domain = this.mapToDomain(r);
            return {
                ...domain,
                user: { id: r.user.id, fullName: r.user.fullName },
            } as ReviewWithUser;
        });

        return { items, total };
    }

    async addReply(reviewId: string, reply: string): Promise<Review> {
        const review = await this.prisma.review.update({
            where: { id: reviewId },
            data: { reply },
        });

        return this.mapToDomain(review);
    }

    async calculateVenueAverageRating(venueId: string): Promise<number> {
        const result = await this.prisma.review.aggregate({
            where: { venueId },
            _avg: { rating: true },
        });

        return result._avg.rating || 0;
    }

    async updateVenueRating(venueId: string): Promise<void> {
        const avgRating = await this.calculateVenueAverageRating(venueId);
        await this.prisma.venue.update({
            where: { id: venueId },
            data: { rating: avgRating },
        });
    }

    private mapToDomain(record: any): Review {
        return new Review(
            record.id,
            record.bookingId,
            record.venueId,
            record.userId,
            record.rating,
            record.comment,
            record.reply,
            record.createdAt,
            record.updatedAt,
        );
    }
}
