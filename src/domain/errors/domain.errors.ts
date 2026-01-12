// ===========================================
// DOMAIN LAYER - Domain Errors
// ===========================================

export abstract class DomainError extends Error {
    abstract readonly code: string;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

// Booking Errors
export class SlotConflictError extends DomainError {
    readonly code = 'SLOT_CONFLICT';

    constructor(courtId: string, startTime: Date, endTime: Date) {
        super(
            `Slot is already held or confirmed for court ${courtId} from ${startTime.toISOString()} to ${endTime.toISOString()}`,
        );
    }
}

export class HoldExpiredError extends DomainError {
    readonly code = 'HOLD_EXPIRED';

    constructor(bookingId: string) {
        super(`Hold for booking ${bookingId} has expired`);
    }
}

export class InvalidBookingTransitionError extends DomainError {
    readonly code = 'INVALID_BOOKING_TRANSITION';

    constructor(from: string, to: string) {
        super(`Invalid booking status transition from ${from} to ${to}`);
    }
}

export class BookingNotFoundError extends DomainError {
    readonly code = 'BOOKING_NOT_FOUND';

    constructor(bookingId: string) {
        super(`Booking ${bookingId} not found`);
    }
}

export class BookingNotOwnedError extends DomainError {
    readonly code = 'BOOKING_NOT_OWNED';

    constructor() {
        super('You do not own this booking');
    }
}

// User Errors
export class UserNotFoundError extends DomainError {
    readonly code = 'USER_NOT_FOUND';

    constructor(identifier: string) {
        super(`User ${identifier} not found`);
    }
}

export class InvalidCredentialsError extends DomainError {
    readonly code = 'INVALID_CREDENTIALS';

    constructor() {
        super('Invalid credentials');
    }
}

export class UserInactiveError extends DomainError {
    readonly code = 'USER_INACTIVE';

    constructor() {
        super('User account is inactive');
    }
}

// Venue/Court Errors
export class VenueNotFoundError extends DomainError {
    readonly code = 'VENUE_NOT_FOUND';

    constructor(venueId: string) {
        super(`Venue ${venueId} not found`);
    }
}

export class CourtNotFoundError extends DomainError {
    readonly code = 'COURT_NOT_FOUND';

    constructor(courtId: string) {
        super(`Court ${courtId} not found`);
    }
}

export class OutsideOperatingHoursError extends DomainError {
    readonly code = 'OUTSIDE_OPERATING_HOURS';

    constructor() {
        super('The selected time slot is outside operating hours');
    }
}

// Authorization Errors
export class UnauthorizedError extends DomainError {
    readonly code = 'UNAUTHORIZED';

    constructor(message = 'Unauthorized access') {
        super(message);
    }
}

export class ForbiddenError extends DomainError {
    readonly code = 'FORBIDDEN';

    constructor(message = 'Access forbidden') {
        super(message);
    }
}
