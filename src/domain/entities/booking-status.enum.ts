// ===========================================
// DOMAIN LAYER - Booking Status Enum
// Based on Booking State Machine v1.0
// ===========================================

export enum BookingStatus {
    HOLD = 'HOLD',
    CONFIRMED = 'CONFIRMED',
    CANCELLED_BY_USER = 'CANCELLED_BY_USER',
    CANCELLED_BY_OWNER = 'CANCELLED_BY_OWNER',
    EXPIRED = 'EXPIRED',
    COMPLETED = 'COMPLETED',
}

// Valid state transitions based on state machine
export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.HOLD]: [
        BookingStatus.CONFIRMED,
        BookingStatus.EXPIRED,
    ],
    [BookingStatus.CONFIRMED]: [
        BookingStatus.CANCELLED_BY_USER,
        BookingStatus.CANCELLED_BY_OWNER,
        BookingStatus.COMPLETED,
    ],
    [BookingStatus.CANCELLED_BY_USER]: [],
    [BookingStatus.CANCELLED_BY_OWNER]: [],
    [BookingStatus.EXPIRED]: [],
    [BookingStatus.COMPLETED]: [],
};

export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// Statuses that block slot availability
export const BLOCKING_STATUSES = [BookingStatus.HOLD, BookingStatus.CONFIRMED];
