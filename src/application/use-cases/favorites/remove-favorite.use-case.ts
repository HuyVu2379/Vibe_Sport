// ===========================================
// APPLICATION LAYER - Remove Favorite Use Case
// ===========================================

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFavoriteRepository, FAVORITE_REPOSITORY } from '../../ports/favorite.repository.port';

export interface RemoveFavoriteInput {
    userId: string;
    venueId: string;
}

@Injectable()
export class RemoveFavoriteUseCase {
    constructor(
        @Inject(FAVORITE_REPOSITORY)
        private readonly favoriteRepository: IFavoriteRepository,
    ) { }

    async execute(input: RemoveFavoriteInput): Promise<void> {
        const { userId, venueId } = input;

        const exists = await this.favoriteRepository.exists(userId, venueId);
        if (!exists) {
            throw new NotFoundException('Favorite not found');
        }

        return this.favoriteRepository.remove(userId, venueId);
    }
}
