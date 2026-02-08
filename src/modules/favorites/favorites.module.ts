// ===========================================
// MODULES - Favorites Module
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

import { FavoritesController } from '../../interfaces/http/favorites/favorites.controller';

// Ports
import { FAVORITE_REPOSITORY } from '../../application/ports/favorite.repository.port';
import { VENUE_REPOSITORY } from '../../application/ports/venue.repository.port';

// Infrastructure implementations
import { FavoriteRepository } from '../../infrastructure/repositories/favorite.repository';
import { VenueRepository } from '../../infrastructure/repositories/venue.repository';

// Use cases
import {
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
    GetUserFavoritesUseCase,
    ToggleFavoriteUseCase,
    CheckIsFavoriteUseCase,
} from '../../application/use-cases/favorites';

@Module({
    imports: [PrismaModule],
    controllers: [FavoritesController],
    providers: [
        // Use Cases
        AddFavoriteUseCase,
        RemoveFavoriteUseCase,
        GetUserFavoritesUseCase,
        ToggleFavoriteUseCase,
        CheckIsFavoriteUseCase,

        // Repository implementations
        { provide: FAVORITE_REPOSITORY, useClass: FavoriteRepository },
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
    ],
    exports: [FAVORITE_REPOSITORY],
})
export class FavoritesModule { }
