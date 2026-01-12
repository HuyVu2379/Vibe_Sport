// ===========================================
// APPLICATION LAYER - Confirm Booking Use Case
// Transitions HOLD -> CONFIRMED with conflict check
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../ports/booking.repository.port';
import { IHoldService, HOLD_SERVICE } from '../../ports/hold.service.port';
import {
    IAuditRepository,
    AUDIT_REPOSITORY,
    ActorType,
} from '../../ports/audit.repository.port';
import {
    BookingStatus,
    isValidTransition,
    BLOCKING_STATUSES,
} from '../../../domain/entities/booking-status.enum';
import { Booking } from '../../../domain/entities/booking.entity';
import {
    BookingNotFoundError,
    BookingNotOwnedError,
    HoldExpiredError,
    InvalidBookingTransitionError,
    SlotConflictError,
} from '../../../domain/errors';

export interface ConfirmBookingInput {
    bookingId: string;
    userId: string;
    note?: string;
}

export interface ConfirmBookingOutput {
    bookingId: string;
    status: BookingStatus;
    courtId: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
}

@Injectable()
export class ConfirmBookingUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(HOLD_SERVICE)
        private readonly holdService: IHoldService,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
    ) { }

    async execute(input: ConfirmBookingInput): Promise<ConfirmBookingOutput> {
        const { bookingId, userId, note } = input;

        // 1. Find booking with lock for update
        const booking = await this.bookingRepository.findByIdWithLock(bookingId);
        if (!booking) {
            throw new BookingNotFoundError(bookingId);
        }

        // 2. Verify ownership
        if (booking.userId !== userId) {
            throw new BookingNotOwnedError();
        }

        // 3. Validate current status is HOLD
        if (booking.status !== BookingStatus.HOLD) {
            throw new InvalidBookingTransitionError(
                booking.status,
                BookingStatus.CONFIRMED,
            );
        }

        // 4. Check if HOLD has expired
        if (booking.isHoldExpired()) {
            // Update booking to EXPIRED
            await this.bookingRepository.update(bookingId, {
                status: BookingStatus.EXPIRED,
            });
            await this.auditRepository.create({
                bookingId,
                fromStatus: BookingStatus.HOLD,
                toStatus: BookingStatus.EXPIRED,
                actorType: ActorType.SYSTEM,
                note: 'Hold expired during confirmation attempt',
            });
            throw new HoldExpiredError(bookingId);
        }

        // 5. Re-check for conflicts (belt and suspenders)
        const conflicts = await this.bookingRepository.findConflicting({
            courtId: booking.courtId,
            startTime: booking.startTime,
            endTime: booking.endTime,
            excludeBookingId: bookingId,
        });

        const activeConflicts = conflicts.filter(
            (b) => b.status === BookingStatus.CONFIRMED,
        );

        if (activeConflicts.length > 0) {
            throw new SlotConflictError(
                booking.courtId,
                booking.startTime,
                booking.endTime,
            );
        }

        // 6. Update booking to CONFIRMED
        const updatedBooking = await this.bookingRepository.update(bookingId, {
            status: BookingStatus.CONFIRMED,
            note,
        });

        // 7. Release Redis hold (slot is now confirmed in DB)
        await this.holdService.releaseHold(
            booking.courtId,
            booking.startTime,
            booking.endTime,
        );

        // 8. Create audit log
        await this.auditRepository.create({
            bookingId,
            fromStatus: BookingStatus.HOLD,
            toStatus: BookingStatus.CONFIRMED,
            actorType: ActorType.CUSTOMER,
            actorId: userId,
            note: note || 'Booking confirmed by customer',
        });

        return {
            bookingId: updatedBooking.id,
            status: updatedBooking.status,
            courtId: updatedBooking.courtId,
            startTime: updatedBooking.startTime,
            endTime: updatedBooking.endTime,
            totalPrice: updatedBooking.totalPrice,
        };
    }
}
