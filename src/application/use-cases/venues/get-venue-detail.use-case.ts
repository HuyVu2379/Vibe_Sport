// ===========================================
// APPLICATION LAYER - Get Venue Detail Use Case
// ===========================================

import { Injectable, Inject } from '@nestjs/common';
import { VENUE_REPOSITORY, IVenueRepository } from '../../ports/venue.repository.port';
import { VenueNotFoundError } from '../../../domain/errors';

export interface VenueDetailResult {
    venueId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    courts: {
        courtId: string;
        name: string;
        sportType: string;
        minPricePerHour: number;
        imageUrls: string[];
    }[];
    imageUrls: string[];
    sportTypes: string[];
    about: string;
    amenities: {
        amenityId: string;
        name: string;
        icon: string;
    }[];
    totalReviews: number;
    ratingAvg: number;
    openHours: {
        dayOfWeek: string;
        openTime: string;
        closeTime: string;
    }[];
    contact: {
        phone: string;
        email: string;
    };
    policy: {
        depositType: string;
        depositPercentage: number;
        cancelBeforeHours: number;
    };
}

export interface GetVenueDetailInput {
    venueId: string;
}

@Injectable()
export class GetVenueDetailUseCase {
    constructor(
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async execute(input: GetVenueDetailInput): Promise<VenueDetailResult> {
        const venue = await this.venueRepository.findByIdWithCourts(input.venueId);
        if (!venue) {
            throw new VenueNotFoundError(input.venueId);
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
            sportTypes: [...new Set<string>(venue.courts.map((court: any) => court.sportType))],
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
