// ===========================================
// APPLICATION LAYER - Favorite Repository Port
// ===========================================

export interface FavoriteVenueWithDetails {
    id: string;
    venueId: string;
    userId: string;
    createdAt: Date;
    venue: {
        id: string;
        name: string;
        address: string;
        imageUrls: string[];
        rating: number | null;
    };
}

export interface IFavoriteRepository {
    add(userId: string, venueId: string): Promise<{ id: string }>;
    remove(userId: string, venueId: string): Promise<void>;
    exists(userId: string, venueId: string): Promise<boolean>;
    findByUserId(userId: string, page: number, size: number): Promise<{ items: FavoriteVenueWithDetails[]; total: number }>;
    countByVenueId(venueId: string): Promise<number>;
}

export const FAVORITE_REPOSITORY = Symbol('FAVORITE_REPOSITORY');
