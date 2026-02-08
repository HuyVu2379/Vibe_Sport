// ===========================================
// INTERFACES LAYER - Favorites Controller
// ===========================================

import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

import { AddFavoriteUseCase } from '../../../application/use-cases/favorites/add-favorite.use-case';
import { RemoveFavoriteUseCase } from '../../../application/use-cases/favorites/remove-favorite.use-case';
import { GetUserFavoritesUseCase } from '../../../application/use-cases/favorites/get-user-favorites.use-case';
import { ToggleFavoriteUseCase } from '../../../application/use-cases/favorites/toggle-favorite.use-case';
import { CheckIsFavoriteUseCase } from '../../../application/use-cases/favorites/check-is-favorite.use-case';

@ApiTags('Favorites')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
    constructor(
        private readonly addFavoriteUseCase: AddFavoriteUseCase,
        private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
        private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
        private readonly toggleFavoriteUseCase: ToggleFavoriteUseCase,
        private readonly checkIsFavoriteUseCase: CheckIsFavoriteUseCase,
    ) { }

    @Post('venues/:venueId/favorite')
    @ApiOperation({ summary: 'Add venue to favorites' })
    async addFavorite(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        return this.addFavoriteUseCase.execute({ userId, venueId });
    }

    @Delete('venues/:venueId/favorite')
    @ApiOperation({ summary: 'Remove venue from favorites' })
    async removeFavorite(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        await this.removeFavoriteUseCase.execute({ userId, venueId });
        return { success: true };
    }

    @Post('venues/:venueId/favorite/toggle')
    @ApiOperation({ summary: 'Toggle venue favorite status' })
    async toggleFavorite(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        return this.toggleFavoriteUseCase.execute({ userId, venueId });
    }

    @Get('favorites')
    @ApiOperation({ summary: 'Get user favorites' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    async getUserFavorites(
        @CurrentUser('userId') userId: string,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    ) {
        return this.getUserFavoritesUseCase.execute({ userId, page, size });
    }

    @Get('venues/:venueId/favorite/status')
    @ApiOperation({ summary: 'Check if venue is favorited' })
    async checkFavoriteStatus(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        const isFavorite = await this.checkIsFavoriteUseCase.execute({ userId, venueId });
        return { isFavorite };
    }
}
