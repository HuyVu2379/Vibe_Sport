
import { Injectable, Inject } from '@nestjs/common';
import { VENUE_REPOSITORY, IVenueRepository, SearchVenuesParams } from '../ports/venue.repository.port';
import { VenueListResponseDto, VenueDetailResponseDto } from '../../interfaces/http/venues/venues.dto';
import { VenueNotFoundError } from '../../domain/errors';

@Injectable()
export class VenueService {
    constructor(
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async searchVenues(query: SearchVenuesParams): Promise<VenueListResponseDto> {
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

    async getVenueDetail(venueId: string): Promise<VenueDetailResponseDto> {
        const venue = await this.venueRepository.findByIdWithCourts(venueId);
        if (!venue) {
            throw new VenueNotFoundError(venueId);
        }

        return {
            venueId: venue.id,
            name: venue.name,
            address: venue.address,
            lat: Number(venue.latitude),
            lng: Number(venue.longitude),
            courts: venue.courts.map((court: any) => {
                const prices = court.pricingRules?.map((p: any) => Number(p.pricePerHour)) || [];
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                return {
                    courtId: court.id,
                    name: court.name,
                    sportType: court.sportType,
                    minPricePerHour: minPrice,
                    imageUrls: court.imageUrls || [],
                };
            }),
            imageUrls: venue.imageUrls || [],
            about: venue.description || '',
            amenities: venue.venueAmenities?.map((va: any) => ({
                amenityId: va.amenity.id,
                name: va.amenity.name,
                icon: va.amenity.icon || '',
            })) || [],
            totalReviews: venue._count?.reviews || 0,
            ratingAvg: venue.rating || 0,
            openHours: venue.operatingHours?.map((oh: any) => ({
                dayOfWeek: oh.dayOfWeek,
                openTime: oh.openTime,
                closeTime: oh.closeTime,
            })) || [],
            contact: {
                phone: venue.owner?.phone || '',
                email: venue.owner?.email || '',
            },
            policy: venue.venuePolicy ? {
                depositType: venue.venuePolicy.depositType,
                depositPercentage: Number(venue.venuePolicy.depositValue),
                cancelBeforeHours: venue.venuePolicy.cancelBeforeHours,
            } : {
                depositType: 'NONE',
                depositPercentage: 0,
                cancelBeforeHours: 24,
            },
        };
    }
}
