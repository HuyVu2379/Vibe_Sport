// ===========================================
// FAVORITES SERVICE
// ===========================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FavoriteRepository, FavoriteVenueWithDetails } from '../../infrastructure/repositories/favorite.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(
        private readonly favoriteRepository: FavoriteRepository,
        private readonly prisma: PrismaService,
    ) { }

    async addFavorite(userId: string, venueId: string): Promise<{ id: string }> {
        // Check venue exists
        const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
        if (!venue) {
            throw new NotFoundException('Venue not found');
        }

        // Check if already favorited
        const exists = await this.favoriteRepository.exists(userId, venueId);
        if (exists) {
            throw new ConflictException('Venue already in favorites');
        }

        return this.favoriteRepository.add(userId, venueId);
    }

    async removeFavorite(userId: string, venueId: string): Promise<void> {
        const exists = await this.favoriteRepository.exists(userId, venueId);
        if (!exists) {
            throw new NotFoundException('Favorite not found');
        }

        return this.favoriteRepository.remove(userId, venueId);
    }

    async getUserFavorites(
        userId: string,
        page = 0,
        size = 10,
    ): Promise<{ items: FavoriteVenueWithDetails[]; total: number }> {
        return this.favoriteRepository.findByUserId(userId, page, size);
    }

    async isFavorite(userId: string, venueId: string): Promise<boolean> {
        return this.favoriteRepository.exists(userId, venueId);
    }

    async toggleFavorite(userId: string, venueId: string): Promise<{ isFavorite: boolean }> {
        const exists = await this.favoriteRepository.exists(userId, venueId);

        if (exists) {
            await this.favoriteRepository.remove(userId, venueId);
            return { isFavorite: false };
        } else {
            await this.favoriteRepository.add(userId, venueId);
            return { isFavorite: true };
        }
    }
}
