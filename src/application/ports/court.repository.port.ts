// ===========================================
// APPLICATION LAYER - Court Repository Port
// ===========================================

import { Court } from '../../domain/entities/court.entity';

export const COURT_REPOSITORY = Symbol('COURT_REPOSITORY');

export interface ICourtRepository {
    findById(id: string): Promise<Court | null>;
    findByVenueId(venueId: string): Promise<Court[]>;
    findByOwnerId(ownerId: string): Promise<Court[]>;
}
