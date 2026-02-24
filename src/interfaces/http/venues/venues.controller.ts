// ===========================================
// INTERFACES LAYER - Venues Controller
// ===========================================

import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import {
    SearchVenuesQueryDto,
    VenueListResponseDto,
    VenueDetailResponseDto,
} from './venues.dto';
import { SearchVenuesUseCase, GetVenueDetailUseCase } from '../../../application/use-cases/venues';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
    constructor(
        private readonly searchVenuesUseCase: SearchVenuesUseCase,
        private readonly getVenueDetailUseCase: GetVenueDetailUseCase,
    ) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Search venues' })
    @ApiResponse({ status: 200, type: VenueListResponseDto })
    async searchVenues(@Query() query: SearchVenuesQueryDto): Promise<VenueListResponseDto> {
        return this.searchVenuesUseCase.execute({
            lat: query.lat,
            lng: query.lng,
            radiusKm: query.radiusKm,
            sportType: query.sportType,
            q: query.q,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            page: query.page,
            size: query.size,
        });
    }

    @Get(':venueId')
    @Public()
    @ApiOperation({ summary: 'Get venue detail with courts' })
    @ApiParam({ name: 'venueId', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, type: VenueDetailResponseDto })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    async getVenueDetail(
        @Param('venueId', ParseUUIDPipe) venueId: string,
    ): Promise<VenueDetailResponseDto> {
        return this.getVenueDetailUseCase.execute({ venueId });
    }
}
