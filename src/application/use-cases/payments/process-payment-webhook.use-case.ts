import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../ports/booking.repository.port';
import { IAuditRepository, AUDIT_REPOSITORY, ActorType } from '../../ports/audit.repository.port';
import { ICourtRepository, COURT_REPOSITORY } from '../../ports/court.repository.port';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';
import { ISocketService, SOCKET_SERVICE } from '../../ports/socket.service.port';
import { IHoldService, HOLD_SERVICE } from '../../ports/hold.service.port';

@Injectable()
export class ProcessPaymentWebhookUseCase {
    private readonly logger = new Logger(ProcessPaymentWebhookUseCase.name);

    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(SOCKET_SERVICE)
        private readonly socketService: ISocketService,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(HOLD_SERVICE)
        private readonly holdService: IHoldService,
    ) { }

    async execute(webhookData: any): Promise<void> {
        const { orderCode, description, amount, success } = webhookData;

        if (!success) {
            this.logger.warn(`Payment failed for order ${orderCode}`);
            return;
        }

        const bookingId = this.extractBookingId(description);
        if (!bookingId) {
            this.logger.error(`Could not extract booking ID from description: ${description}`);
            return;
        }

        const booking = await this.bookingRepository.findByIdWithLock(bookingId);
        if (!booking) {
            this.logger.error(`Booking not found: ${bookingId}`);
            return;
        }

        if (booking.status !== BookingStatus.HOLD) {
            this.logger.warn(`Booking ${bookingId} is not in HOLD status (${booking.status}). Ignoring payment.`);
            return;
        }

        // Confirm the booking
        const updatedBooking = await this.bookingRepository.update(bookingId, {
            status: BookingStatus.CONFIRMED,
            note: `Payment received via PayOS. Order: ${orderCode}`,
        });

        // Release Hold
        await this.holdService.releaseHold(booking.courtId, booking.startTime, booking.endTime);

        // Audit Log
        await this.auditRepository.create({
            bookingId: booking.id,
            fromStatus: BookingStatus.HOLD,
            toStatus: BookingStatus.CONFIRMED,
            actorType: ActorType.SYSTEM,
            note: `Payment success. OrderCode: ${orderCode}`,
        });

        // Emit socket events
        this.socketService.emitToUser(updatedBooking.userId, 'booking.confirmed', {
            bookingId: updatedBooking.id,
            status: BookingStatus.CONFIRMED,
        });

        const court = await this.courtRepository.findById(updatedBooking.courtId);
        if (court) {
            this.socketService.emitToVenue(court.venueId, 'slot.updated', {
                courtId: updatedBooking.courtId,
                startTime: updatedBooking.startTime,
                endTime: updatedBooking.endTime,
                status: BookingStatus.CONFIRMED,
                bookingId: updatedBooking.id,
            });
        }

        this.logger.log(`Booking ${bookingId} confirmed via webhook.`);
    }

    private extractBookingId(description: string): string | null {
        // Look for UUID in description
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = description.match(uuidRegex);
        return match ? match[0] : null;
    }
}
