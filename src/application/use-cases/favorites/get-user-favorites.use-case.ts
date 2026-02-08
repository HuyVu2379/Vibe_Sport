// ===========================================
// APPLICATION LAYER - Get User Favorites Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IFavoriteRepository, FAVORITE_REPOSITORY, FavoriteVenueWithDetails } from '../../ports/favorite.repository.port';

export interface GetUserFavoritesInput {
    userId: string;
    page?: number;
    size?: number;
}

export interface GetUserFavoritesOutput {
    items: FavoriteVenueWithDetails[];
    total: number;
}

@Injectable()
export class GetUserFavoritesUseCase {
    constructor(
        @Inject(FAVORITE_REPOSITORY)
        private readonly favoriteRepository: IFavoriteRepository,
    ) { }

    async execute(input: GetUserFavoritesInput): Promise<GetUserFavoritesOutput> {
        const { userId, page = 0, size = 10 } = input;
        return this.favoriteRepository.findByUserId(userId, page, size);
    }
}
