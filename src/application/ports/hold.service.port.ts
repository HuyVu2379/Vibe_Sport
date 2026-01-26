// ===========================================
// APPLICATION LAYER - Hold Service Port
// Redis-based slot locking interface
// ===========================================

export interface HoldData {
    bookingId: string;
    userId: string;
}

export const HOLD_SERVICE = Symbol('HOLD_SERVICE');

export interface IHoldService {
    /**
     * Attempt to acquire a hold on a slot
     * Returns true if successful, false if slot is already held
     */
    acquireHold(
        courtId: string,
        startTime: Date,
        endTime: Date,
        data: HoldData,
        ttlSeconds: number,
    ): Promise<boolean>;

    /**
     * Update an existing hold (overwrite)
     */
    updateHold(
        courtId: string,
        startTime: Date,
        endTime: Date,
        data: HoldData,
        ttlSeconds: number,
    ): Promise<void>;

    /**
     * Release a hold on a slot
     */
    releaseHold(courtId: string, startTime: Date, endTime: Date): Promise<void>;

    /**
     * Check if a slot is currently held
     */
    isHeld(courtId: string, startTime: Date, endTime: Date): Promise<boolean>;

    /**
     * Get hold data for a slot
     */
    getHoldData(courtId: string, startTime: Date, endTime: Date): Promise<HoldData | null>;

    /**
     * Get remaining TTL for a hold in seconds
     */
    getHoldTtl(courtId: string, startTime: Date, endTime: Date): Promise<number>;
}
