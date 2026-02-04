// ===========================================
// FAVORITES MODULE
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { FavoriteRepository } from '../../infrastructure/repositories/favorite.repository';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
    imports: [PrismaModule],
    controllers: [FavoritesController],
    providers: [FavoritesService, FavoriteRepository],
    exports: [FavoritesService, FavoriteRepository],
})
export class FavoritesModule { }
