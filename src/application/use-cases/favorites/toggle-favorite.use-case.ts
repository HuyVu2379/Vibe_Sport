// ===========================================
// APPLICATION LAYER - Toggle Favorite Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IFavoriteRepository, FAVORITE_REPOSITORY } from '../../ports/favorite.repository.port';

export interface ToggleFavoriteInput {
    userId: string;
    venueId: string;
}

@Injectable()
export class ToggleFavoriteUseCase {
    constructor(
        @Inject(FAVORITE_REPOSITORY)
        private readonly favoriteRepository: IFavoriteRepository,
    ) { }

    async execute(input: ToggleFavoriteInput): Promise<{ isFavorite: boolean }> {
        const { userId, venueId } = input;

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
