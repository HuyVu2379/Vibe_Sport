// ===========================================
// APPLICATION LAYER - Cancel Booking Use Case
// Handles HOLD -> CANCELLED and CONFIRMED -> CANCELLED transitions
// Implements BR-REL-03, BR-REL-05, BR-REL-06
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
import { IHoldService, HOLD_SERVICE } from '../../ports/hold.service.port';
import { ISocketService, SOCKET_SERVICE } from '../../ports/socket.service.port';
import { BookingStatus, isValidTransition } from '../../../domain/entities/booking-status.enum';
import {
    BookingNotFoundError,
    BookingNotOwnedError,
    InvalidBookingTransitionError,
    CancellationWindowClosedError,
    BookingAlreadyStartedError,
} from '../../../domain/errors';
import { IVenueRepository, VENUE_REPOSITORY } from '../../ports/venue.repository.port';
import { ICourtRepository, COURT_REPOSITORY } from '../../ports/court.repository.port';

export interface CancelBookingInput {
    bookingId: string;
    userId: string;
    reason: string;
    isOwner: boolean;
}

export interface CancelBookingOutput {
    bookingId: string;
    status: BookingStatus;
    refundPercentage?: number;
}

@Injectable()
export class CancelBookingUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
        @Inject(HOLD_SERVICE)
        private readonly holdService: IHoldService,
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(SOCKET_SERVICE)
        private readonly socketService: ISocketService,
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

        const court = await this.courtRepository.findById(booking.courtId);
        let refundPercentage: number | undefined;

        // 5. Handle based on current booking status
        if (booking.status === BookingStatus.HOLD) {
            // ===== BR-REL-03: Cancel during HOLD =====
            // No cancellation window check needed (no payment yet)
            // Release Redis hold immediately
            await this.holdService.releaseHold(
                booking.courtId,
                booking.startTime,
                booking.endTime,
            );
            refundPercentage = undefined; // No payment, no refund
        } else if (booking.status === BookingStatus.CONFIRMED) {
            // ===== BR-REL-05 / BR-REL-06: Cancel CONFIRMED booking =====

            // BR-REL-05 edge case: Cannot cancel after startTime has passed
            if (!isOwner && new Date() >= booking.startTime) {
                throw new BookingAlreadyStartedError();
            }

            if (isOwner) {
                // BR-REL-06: Owner cancellation → always 100% refund
                refundPercentage = 100;
            } else {
                // BR-REL-05: Customer cancellation → check cancellation window
                const policy = court
                    ? await this.venueRepository.findPolicyByVenueId(court.venueId)
                    : null;
                const cancelBeforeHours = policy?.cancelBeforeHours ?? 24;

                const now = new Date();
                const limitTime = new Date(
                    booking.startTime.getTime() - cancelBeforeHours * 60 * 60 * 1000,
                );

                if (now > limitTime) {
                    throw new CancellationWindowClosedError(cancelBeforeHours);
                }

                // Within window → 100% refund
                refundPercentage = 100;
            }
        }

        // 6. Update booking status
        const updatedBooking = await this.bookingRepository.update(bookingId, {
            status: targetStatus,
        });

        // 7. Create audit log
        await this.auditRepository.create({
            bookingId,
            fromStatus: booking.status,
            toStatus: targetStatus,
            actorType: isOwner ? ActorType.OWNER : ActorType.CUSTOMER,
            actorId: userId,
            note: reason,
        });

        // 8. Emit socket events for real-time availability update (BR-REL-09)
        if (court) {
            this.socketService.emitToVenue(court.venueId, 'slot.released', {
                courtId: booking.courtId,
                startTime: booking.startTime,
                endTime: booking.endTime,
                bookingId: booking.id,
                releasedBy: isOwner ? 'OWNER' : 'CUSTOMER',
            });

            // Notify the customer if owner cancelled
            if (isOwner) {
                this.socketService.emitToUser(booking.userId, 'booking.cancelled', {
                    bookingId: booking.id,
                    status: targetStatus,
                    reason,
                    refundPercentage: 100,
                });
            }
        }

        return {
            bookingId: updatedBooking.id,
            status: updatedBooking.status,
            refundPercentage,
        };
    }
}
