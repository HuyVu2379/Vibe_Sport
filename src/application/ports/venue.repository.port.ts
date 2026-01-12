// ===========================================
// APPLICATION LAYER - Venue Repository Port
// ===========================================

import { Venue } from '../../domain/entities/venue.entity';

export interface SearchVenuesParams {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    sportType?: string;
    q?: string;
    page?: number;
    size?: number;
}

export interface PaginatedResult<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
}

export interface VenueWithDistance extends Venue {
    distanceKm?: number;
    sportTypes: string[];
}

export const VENUE_REPOSITORY = Symbol('VENUE_REPOSITORY');

export interface IVenueRepository {
    findById(id: string): Promise<Venue | null>;
    findByIdWithCourts(id: string): Promise<any | null>;
    search(params: SearchVenuesParams): Promise<PaginatedResult<VenueWithDistance>>;
    findByOwnerId(ownerId: string): Promise<Venue[]>;
}
