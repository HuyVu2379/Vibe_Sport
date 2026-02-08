// ===========================================
// APPLICATION LAYER - Analytics Repository Port
// ===========================================

export interface AnalyticsSummary {
    totalRevenue: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
}

export interface IAnalyticsRepository {
    getVenueAnalytics(venueId: string, from: Date, to: Date): Promise<AnalyticsSummary>;
}

export const ANALYTICS_REPOSITORY = Symbol('ANALYTICS_REPOSITORY');
