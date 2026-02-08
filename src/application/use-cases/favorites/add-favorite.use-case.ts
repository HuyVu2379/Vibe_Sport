// ===========================================
// APPLICATION LAYER - Add Favorite Use Case
// ===========================================

import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { IFavoriteRepository, FAVORITE_REPOSITORY } from '../../ports/favorite.repository.port';
import { IVenueRepository, VENUE_REPOSITORY } from '../../ports/venue.repository.port';
import { VenueNotFoundError } from '../../../domain/errors';

export interface AddFavoriteInput {
    userId: string;
    venueId: string;
}

@Injectable()
export class AddFavoriteUseCase {
    constructor(
        @Inject(FAVORITE_REPOSITORY)
        private readonly favoriteRepository: IFavoriteRepository,
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async execute(input: AddFavoriteInput): Promise<{ id: string }> {
        const { userId, venueId } = input;

        // Check venue exists using port
        const venue = await this.venueRepository.findById(venueId);
        if (!venue) {
            throw new VenueNotFoundError(venueId);
        }

        // Check if already favorited
        const exists = await this.favoriteRepository.exists(userId, venueId);
        if (exists) {
            throw new ConflictException('Venue already in favorites');
        }

        return this.favoriteRepository.add(userId, venueId);
    }
}
