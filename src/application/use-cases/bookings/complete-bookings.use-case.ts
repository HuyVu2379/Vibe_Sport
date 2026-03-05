// ===========================================
// APPLICATION LAYER - Complete Bookings Use Case
// BR-REL-07: Auto-complete CONFIRMED bookings after endTime passes
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../ports/booking.repository.port';
import {
    IAuditRepository,
    AUDIT_REPOSITORY,
    ActorType,
} from '../../ports/audit.repository.port';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';

export interface CompleteBookingsOutput {
    completedCount: number;
}

@Injectable()
export class CompleteBookingsUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
        @InjectPinoLogger(CompleteBookingsUseCase.name)
        private readonly logger: PinoLogger,
    ) { }

    /**
     * BR-REL-07: Mark CONFIRMED bookings as COMPLETED when endTime has passed.
     * COMPLETED is a terminal state — no further transitions allowed.
     *
     * Uses bulk update for efficiency, then logs each completion.
     */
    async execute(): Promise<CompleteBookingsOutput> {
        // 1. First, find bookings that will be completed (for audit logging)
        const bookingsToComplete = await this.bookingRepository.findMany({
            status: BookingStatus.CONFIRMED,
            to: new Date(), // endTime <= now (using 'to' as filter for startTime, we need custom query)
        });

        // 2. Bulk update: CONFIRMED → COMPLETED where endTime <= now
        const completedCount = await this.bookingRepository.completeExpiredBookings();

        if (completedCount > 0) {
            this.logger.info(`Completed ${completedCount} bookings that have passed their endTime`);

            // 3. Create audit logs for completed bookings
            // We use the items found before the bulk update
            for (const booking of bookingsToComplete.items) {
                if (booking.endTime <= new Date()) {
                    try {
                        await this.auditRepository.create({
                            bookingId: booking.id,
                            fromStatus: BookingStatus.CONFIRMED,
                            toStatus: BookingStatus.COMPLETED,
                            actorType: ActorType.SYSTEM,
                            note: 'BOOKING_COMPLETED — auto-completed by scheduler after endTime',
                        });
                    } catch (error) {
                        this.logger.error(
                            { bookingId: booking.id, error },
                            'Failed to create audit log for completed booking',
                        );
                    }
                }
            }
        }

        return { completedCount };
    }
}
