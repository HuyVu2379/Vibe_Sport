// ===========================================
// APPLICATION LAYER - Venue Mapper
// Transforms repository data to API responses
// ===========================================

import { Injectable } from '@nestjs/common';
import {
    VenueListResponseDto,
    VenueDetailResponseDto,
    VenueListItemDto,
    CourtItemDto,
    Amentity,
    OpenHour,
    Contact,
    Policy,
} from '../../interfaces/http/venues/venues.dto';

export interface VenueSearchResult {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    distanceKm?: number;
    sportTypes: string[];
    totalCourts: number;
    totalReviews: number;
    ratingAvg: number;
    minPricePerHour: number;
    imageUrl?: string;
}

export interface PaginatedVenueSearchResult {
    items: VenueSearchResult[];
    page: number;
    size: number;
    total: number;
}

@Injectable()
export class VenueMapper {
    /**
     * Maps search result to list response DTO
     */
    toListResponse(result: PaginatedVenueSearchResult): VenueListResponseDto {
        return {
            items: result.items.map((venue) => this.toSearchItem(venue)),
            page: result.page,
            size: result.size,
            total: result.total,
        };
    }

    /**
     * Maps a single venue search result to a list item
     */
    toSearchItem(venue: VenueSearchResult): VenueListItemDto {
        return {
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
        };
    }

    /**
     * Maps venue with courts to detail response DTO
     */
    toDetailResponse(venue: any): VenueDetailResponseDto {
        return {
            venueId: venue.id,
            name: venue.name,
            address: venue.address,
            lat: Number(venue.latitude),
            lng: Number(venue.longitude),
            courts: this.mapCourts(venue.courts),
            imageUrls: venue.imageUrls || [],
            about: venue.description || '',
            amenities: this.mapAmenities(venue.venueAmenities),
            totalReviews: venue._count?.reviews || 0,
            ratingAvg: venue.rating || 0,
            openHours: this.mapOpenHours(venue.operatingHours),
            contact: this.mapContact(venue.owner),
            policy: this.mapPolicy(venue.venuePolicy),
        };
    }

    private mapCourts(courts: any[] = []): CourtItemDto[] {
        return courts.map((court) => {
            const prices = court.pricingRules?.map((p: any) => Number(p.pricePerHour)) || [];
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return {
                courtId: court.id,
                name: court.name,
                sportType: court.sportType,
                minPricePerHour: minPrice,
                imageUrls: court.imageUrls || [],
            };
        });
    }

    private mapAmenities(venueAmenities: any[] = []): Amentity[] {
        return venueAmenities.map((va) => ({
            amenityId: va.amenity.id,
            name: va.amenity.name,
            icon: va.amenity.icon || '',
        }));
    }

    private mapOpenHours(operatingHours: any[] = []): OpenHour[] {
        return operatingHours.map((oh) => ({
            dayOfWeek: oh.dayOfWeek,
            openTime: oh.openTime,
            closeTime: oh.closeTime,
        }));
    }

    private mapContact(owner: any): Contact {
        return {
            phone: owner?.phone || '',
            email: owner?.email || '',
        };
    }

    private mapPolicy(venuePolicy: any): Policy {
        if (!venuePolicy) {
            return {
                depositType: 'NONE',
                depositPercentage: 0,
                cancelBeforeHours: 24,
            };
        }
        return {
            depositType: venuePolicy.depositType,
            depositPercentage: Number(venuePolicy.depositValue),
            cancelBeforeHours: venuePolicy.cancelBeforeHours,
        };
    }
}
