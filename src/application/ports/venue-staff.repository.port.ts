export const VENUE_STAFF_REPOSITORY = Symbol('VENUE_STAFF_REPOSITORY');

export interface IVenueStaffRepository {
    addStaff(venueId: string, userId: string): Promise<void>;
    removeStaff(venueId: string, userId: string): Promise<void>;
    isStaffOfVenue(userId: string, venueId: string): Promise<boolean>;
    findStaffByVenueId(venueId: string): Promise<string[]>; // returns userIds
}
