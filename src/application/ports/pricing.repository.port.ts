// ===========================================
// APPLICATION LAYER - Pricing Repository Port
// ===========================================

export interface PricingRule {
    id: string;
    courtId: string;
    dayType: 'WEEKDAY' | 'WEEKEND';
    startTime: string;
    endTime: string;
    pricePerHour: number;
    isPeak: boolean;
}

export interface OperatingHours {
    id: string;
    courtId: string;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export const PRICING_REPOSITORY = Symbol('PRICING_REPOSITORY');

export interface IPricingRepository {
    findPricingRulesByCourtId(courtId: string): Promise<PricingRule[]>;
    findOperatingHoursByCourtId(courtId: string): Promise<OperatingHours[]>;
    calculatePrice(courtId: string, startTime: Date, endTime: Date): Promise<number>;
}
