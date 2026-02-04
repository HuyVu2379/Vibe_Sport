// ===========================================
// INFRASTRUCTURE - Favorite Repository
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface FavoriteVenueWithDetails {
    id: string;
    venueId: string;
    userId: string;
    createdAt: Date;
    venue: {
        id: string;
        name: string;
        address: string;
        imageUrls: string[];
        rating: number | null;
    };
}

@Injectable()
export class FavoriteRepository {
    constructor(private readonly prisma: PrismaService) { }

    async add(userId: string, venueId: string): Promise<{ id: string }> {
        const favorite = await this.prisma.favoriteVenue.create({
            data: { userId, venueId },
        });

        return { id: favorite.id };
    }

    async remove(userId: string, venueId: string): Promise<void> {
        await this.prisma.favoriteVenue.deleteMany({
            where: { userId, venueId },
        });
    }

    async exists(userId: string, venueId: string): Promise<boolean> {
        const count = await this.prisma.favoriteVenue.count({
            where: { userId, venueId },
        });

        return count > 0;
    }

    async findByUserId(userId: string, page = 0, size = 10): Promise<{ items: FavoriteVenueWithDetails[]; total: number }> {
        const [favorites, total] = await Promise.all([
            this.prisma.favoriteVenue.findMany({
                where: { userId },
                include: {
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            imageUrls: true,
                            rating: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: page * size,
                take: size,
            }),
            this.prisma.favoriteVenue.count({ where: { userId } }),
        ]);

        return { items: favorites as FavoriteVenueWithDetails[], total };
    }

    async countByVenueId(venueId: string): Promise<number> {
        return this.prisma.favoriteVenue.count({ where: { venueId } });
    }
}
