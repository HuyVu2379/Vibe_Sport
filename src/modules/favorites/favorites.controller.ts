// ===========================================
// FAVORITES CONTROLLER
// ===========================================

import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { CurrentUser } from '../../interfaces/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Post('venues/:venueId/favorite')
    @ApiOperation({ summary: 'Add venue to favorites' })
    async addFavorite(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        return this.favoritesService.addFavorite(userId, venueId);
    }

    @Delete('venues/:venueId/favorite')
    @ApiOperation({ summary: 'Remove venue from favorites' })
    async removeFavorite(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        await this.favoritesService.removeFavorite(userId, venueId);
        return { success: true };
    }

    @Post('venues/:venueId/favorite/toggle')
    @ApiOperation({ summary: 'Toggle venue favorite status' })
    async toggleFavorite(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        return this.favoritesService.toggleFavorite(userId, venueId);
    }

    @Get('favorites')
    @ApiOperation({ summary: 'Get user favorites' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    async getUserFavorites(
        @CurrentUser('userId') userId: string,
        @Query('page') page = 0,
        @Query('size') size = 10,
    ) {
        return this.favoritesService.getUserFavorites(userId, Number(page), Number(size));
    }

    @Get('venues/:venueId/favorite/status')
    @ApiOperation({ summary: 'Check if venue is favorited' })
    async checkFavoriteStatus(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        const isFavorite = await this.favoritesService.isFavorite(userId, venueId);
        return { isFavorite };
    }
}
