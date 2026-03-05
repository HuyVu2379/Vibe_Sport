// ===========================================
// APPLICATION LAYER - Expire Holds Use Case
// BR-REL-02: Auto-expire HOLD bookings when TTL passes
// BR-REL-08: Reconcile stale holds (system recovery)
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
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
import { ISocketService, SOCKET_SERVICE } from '../../ports/socket.service.port';
import { ICourtRepository, COURT_REPOSITORY } from '../../ports/court.repository.port';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';

export interface ExpireHoldsOutput {
    expiredCount: number;
    reconciledCount: number;
}

@Injectable()
export class ExpireHoldsUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(HOLD_SERVICE)
        private readonly holdService: IHoldService,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(SOCKET_SERVICE)
        private readonly socketService: ISocketService,
        @InjectPinoLogger(ExpireHoldsUseCase.name)
        private readonly logger: PinoLogger,
    ) { }

    /**
     * BR-REL-02: Expire holds that have passed their TTL
     * This is the fallback mechanism — Redis TTL auto-expires the key,
     * but PostgreSQL needs to be synced as well.
     */
    async expireHolds(): Promise<number> {
        // 1. Find stale holds (HOLD in DB but holdExpiresAt has passed)
        const staleHolds = await this.bookingRepository.findStaleHolds();

        if (staleHolds.length === 0) {
            return 0;
        }

        this.logger.info(`Found ${staleHolds.length} stale HOLD bookings to expire`);

        let expiredCount = 0;

        for (const booking of staleHolds) {
            try {
                // 2. Update booking status to EXPIRED
                await this.bookingRepository.update(booking.id, {
                    status: BookingStatus.EXPIRED,
                });

                // 3. Ensure Redis key is cleaned up (belt and suspenders)
                await this.holdService.releaseHold(
                    booking.courtId,
                    booking.startTime,
                    booking.endTime,
                );

                // 4. Audit log (BR-REL-09: mandatory after every release)
                await this.auditRepository.create({
                    bookingId: booking.id,
                    fromStatus: BookingStatus.HOLD,
                    toStatus: BookingStatus.EXPIRED,
                    actorType: ActorType.SYSTEM,
                    note: 'HOLD_TTL_EXPIRED — auto-expired by scheduler',
                });

                // 5. Broadcast availability update via socket
                const court = await this.courtRepository.findById(booking.courtId);
                if (court) {
                    this.socketService.emitToVenue(court.venueId, 'slot.released', {
                        courtId: booking.courtId,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        bookingId: booking.id,
                        releasedBy: 'SYSTEM',
                        reason: 'HOLD_TTL_EXPIRED',
                    });
                }

                // 6. Notify the user that their hold has expired
                this.socketService.emitToUser(booking.userId, 'booking.expired', {
                    bookingId: booking.id,
                    status: BookingStatus.EXPIRED,
                    reason: 'Hold time expired',
                });

                expiredCount++;
            } catch (error) {
                this.logger.error(
                    { bookingId: booking.id, error },
                    'Failed to expire stale hold',
                );
            }
        }

        this.logger.info(`Expired ${expiredCount} stale HOLD bookings`);
        return expiredCount;
    }

    /**
     * BR-REL-08: Reconcile ghost holds — HOLD in DB but Redis key already gone
     * This handles the scenario after a system crash/restart where Redis keys
     * may have expired but PostgreSQL was not updated.
     */
    async reconcileHolds(): Promise<number> {
        const staleHolds = await this.bookingRepository.findStaleHolds();

        if (staleHolds.length === 0) {
            return 0;
        }

        this.logger.info(`Reconciliation: checking ${staleHolds.length} potentially stale holds`);

        let reconciledCount = 0;

        for (const booking of staleHolds) {
            try {
                // Check if Redis key still exists
                const isHeld = await this.holdService.isHeld(
                    booking.courtId,
                    booking.startTime,
                    booking.endTime,
                );

                if (!isHeld) {
                    // Ghost hold detected — Redis key gone but DB still in HOLD
                    await this.bookingRepository.update(booking.id, {
                        status: BookingStatus.EXPIRED,
                    });

                    await this.auditRepository.create({
                        bookingId: booking.id,
                        fromStatus: BookingStatus.HOLD,
                        toStatus: BookingStatus.EXPIRED,
                        actorType: ActorType.SYSTEM,
                        note: 'SYSTEM_RECOVERY_RECONCILIATION — ghost hold detected',
                    });

                    const court = await this.courtRepository.findById(booking.courtId);
                    if (court) {
                        this.socketService.emitToVenue(court.venueId, 'slot.released', {
                            courtId: booking.courtId,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            bookingId: booking.id,
                            releasedBy: 'SYSTEM',
                            reason: 'SYSTEM_RECOVERY_RECONCILIATION',
                        });
                    }

                    reconciledCount++;
                    this.logger.warn(
                        { bookingId: booking.id },
                        'Ghost hold reconciled — booking expired',
                    );
                }
            } catch (error) {
                this.logger.error(
                    { bookingId: booking.id, error },
                    'Failed to reconcile hold',
                );
            }
        }

        this.logger.info(`Reconciled ${reconciledCount} ghost holds`);
        return reconciledCount;
    }
}
