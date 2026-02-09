// ===========================================
// APPLICATION LAYER - Search Venues Use Case
// ===========================================

import { Injectable, Inject } from '@nestjs/common';
import { VENUE_REPOSITORY, IVenueRepository, SearchVenuesParams } from '../../ports/venue.repository.port';

export interface SearchVenuesResult {
    items: {
        venueId: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        distanceKm?: number;
        sportTypes: string[];
        totalCourts: number;
        totalReviews: number;
        ratingAvg: number;
        minPricePerHour: number;
        imageUrl: string;
    }[];
    page: number;
    size: number;
    total: number;
}

@Injectable()
export class SearchVenuesUseCase {
    constructor(
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async execute(query: SearchVenuesParams): Promise<SearchVenuesResult> {
        const result = await this.venueRepository.search(query);

        return {
            items: result.items.map((venue) => ({
                venueId: venue.id,
                name: venue.name,
                address: venue.address,
                lat: venue.latitude,
                lng: venue.longitude,
                distanceKm: venue.distanceKm,
                sportTypes: venue.sportTypes,
                totalCourts: venue.totalCourts,
                totalReviews: venue.totalReviews,
                ratingAvg: venue.ratingAvg,
                minPricePerHour: venue.minPricePerHour,
                imageUrl: venue.imageUrl || '',
            })),
            page: result.page,
            size: result.size,
            total: result.total,
        };
    }
}
