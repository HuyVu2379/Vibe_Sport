// ===========================================
// APPLICATION LAYER - Booking Repository Port
// Framework-agnostic interface
// ===========================================

import { Booking } from '../../domain/entities/booking.entity';
import { BookingStatus } from '../../domain/entities/booking-status.enum';

export interface CreateBookingData {
    userId: string;
    courtId: string;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    holdExpiresAt?: Date;
    totalPrice: number;
    note?: string;
}

export interface UpdateBookingData {
    status?: BookingStatus;
    note?: string;
}

export interface FindConflictingBookingsParams {
    courtId: string;
    startTime: Date;
    endTime: Date;
    excludeBookingId?: string;
}

export interface FindBookingsParams {
    userId?: string;
    courtId?: string;
    status?: BookingStatus | BookingStatus[];
    from?: Date;
    to?: Date;
    page?: number;
    size?: number;
}

export interface PaginatedResult<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
}

/**
 * Booking with venue info - needed for reviews
 */
export interface BookingWithVenue {
    id: string;
    userId: string;
    status: string;
    venueId: string;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository {
    create(data: CreateBookingData): Promise<Booking>;
    findById(id: string): Promise<Booking | null>;
    findByIdWithLock(id: string): Promise<Booking | null>;
    findByIdWithVenue(id: string): Promise<BookingWithVenue | null>;
    update(id: string, data: UpdateBookingData): Promise<Booking>;
    findConflicting(params: FindConflictingBookingsParams): Promise<Booking[]>;
    findMany(params: FindBookingsParams): Promise<PaginatedResult<Booking>>;
    findByUserIdAndCourtIds(userId: string, courtIds: string[]): Promise<PaginatedResult<Booking>>;
    expireHolds(): Promise<number>;

    /**
     * BR-REL-07: Mark CONFIRMED bookings as COMPLETED when endTime has passed
     */
    completeExpiredBookings(): Promise<number>;

    /**
     * BR-REL-08: Find stale HOLD bookings (holdExpiresAt passed but still in HOLD status)
     * Used for system recovery reconciliation
     */
    findStaleHolds(): Promise<Booking[]>;
}

