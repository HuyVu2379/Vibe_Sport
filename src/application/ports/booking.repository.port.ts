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

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository {
    create(data: CreateBookingData): Promise<Booking>;
    findById(id: string): Promise<Booking | null>;
    findByIdWithLock(id: string): Promise<Booking | null>;
    update(id: string, data: UpdateBookingData): Promise<Booking>;
    findConflicting(params: FindConflictingBookingsParams): Promise<Booking[]>;
    findMany(params: FindBookingsParams): Promise<PaginatedResult<Booking>>;
    findByUserIdAndCourtIds(userId: string, courtIds: string[]): Promise<PaginatedResult<Booking>>;
    expireHolds(): Promise<number>;
}
