// ===========================================
// APPLICATION LAYER - Cancel Booking Use Case
// Handles CONFIRMED -> CANCELLED transitions
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../ports/booking.repository.port';
import {
    IAuditRepository,
    AUDIT_REPOSITORY,
    ActorType,
} from '../../ports/audit.repository.port';
import { BookingStatus, isValidTransition } from '../../../domain/entities/booking-status.enum';
import {
    BookingNotFoundError,
    BookingNotOwnedError,
    InvalidBookingTransitionError,
} from '../../../domain/errors';

export interface CancelBookingInput {
    bookingId: string;
    userId: string;
    reason: string;
    isOwner: boolean;
}

export interface CancelBookingOutput {
    bookingId: string;
    status: BookingStatus;
}

@Injectable()
export class CancelBookingUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
    ) { }

    async execute(input: CancelBookingInput): Promise<CancelBookingOutput> {
        const { bookingId, userId, reason, isOwner } = input;

        // 1. Find booking
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        // 2. For customer cancellation, verify ownership
        if (!isOwner && booking.userId !== userId) {
            throw new BookingNotOwnedError();
        }

        // 3. Determine target status
        const targetStatus = isOwner
            ? BookingStatus.CANCELLED_BY_OWNER
            : BookingStatus.CANCELLED_BY_USER;

        // 4. Validate transition
        if (!isValidTransition(booking.status, targetStatus)) {
            throw new InvalidBookingTransitionError(booking.status, targetStatus);
        }

        // 5. Update booking
        const updatedBooking = await this.bookingRepository.update(bookingId, {
            status: targetStatus,
        });

        // 6. Create audit log
        await this.auditRepository.create({
            bookingId,
            fromStatus: booking.status,
            toStatus: targetStatus,
            actorType: isOwner ? ActorType.OWNER : ActorType.CUSTOMER,
            actorId: userId,
            note: reason,
        });

        return {
            bookingId: updatedBooking.id,
            status: updatedBooking.status,
        };
    }
}
