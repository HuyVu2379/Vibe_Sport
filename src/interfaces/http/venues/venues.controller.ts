// ===========================================
// INTERFACES LAYER - Venues Controller
// ===========================================

import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import { VENUE_REPOSITORY, IVenueRepository } from '../../../application/ports';
import {
    SearchVenuesQueryDto,
    VenueListResponseDto,
    VenueDetailResponseDto,
} from './venues.dto';
import { VenueNotFoundError } from '../../../domain/errors';
import { VenueMapper } from '../../../application/mappers/venue.mapper';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
    constructor(
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
        private readonly venueMapper: VenueMapper,
    ) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Search venues' })
    @ApiResponse({ status: 200, type: VenueListResponseDto })
    async searchVenues(@Query() query: SearchVenuesQueryDto): Promise<VenueListResponseDto> {
        const result = await this.venueRepository.search({
            lat: query.lat,
            lng: query.lng,
            radiusKm: query.radiusKm,
            sportType: query.sportType,
            q: query.q,
            date: query.date,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            page: query.page,
            size: query.size,
        });

        return this.venueMapper.toListResponse(result);
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
        const venue = await this.venueRepository.findByIdWithCourts(venueId);
        if (!venue) {
            throw new VenueNotFoundError(venueId);
        }

        return this.venueMapper.toDetailResponse(venue);
    }
}
