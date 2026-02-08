// ===========================================
// APPLICATION LAYER - Check Is Favorite Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IFavoriteRepository, FAVORITE_REPOSITORY } from '../../ports/favorite.repository.port';

export interface CheckIsFavoriteInput {
    userId: string;
    venueId: string;
}

@Injectable()
export class CheckIsFavoriteUseCase {
    constructor(
        @Inject(FAVORITE_REPOSITORY)
        private readonly favoriteRepository: IFavoriteRepository,
    ) { }

    async execute(input: CheckIsFavoriteInput): Promise<boolean> {
        const { userId, venueId } = input;
        return this.favoriteRepository.exists(userId, venueId);
    }
}
