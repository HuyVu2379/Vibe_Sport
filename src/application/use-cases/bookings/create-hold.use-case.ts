// ===========================================
// APPLICATION LAYER - Create Hold Use Case
// Implements HOLD creation with Redis lock
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { ICourtRepository, COURT_REPOSITORY } from '../../ports/court.repository.port';
import { IPricingRepository, PRICING_REPOSITORY } from '../../ports/pricing.repository.port';
import { BookingStatus, BLOCKING_STATUSES } from '../../../domain/entities/booking-status.enum';
import { Booking } from '../../../domain/entities/booking.entity';
import {
    SlotConflictError,
    CourtNotFoundError,
    OutsideOperatingHoursError,
} from '../../../domain/errors';

export interface CreateHoldInput {
    userId: string;
    courtId: string;
    startTime: Date;
    endTime: Date;
}

export interface CreateHoldOutput {
    bookingId: string;
    status: BookingStatus;
    holdExpiresAt: Date;
    totalPrice: number;
}

@Injectable()
export class CreateHoldUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(HOLD_SERVICE)
        private readonly holdService: IHoldService,
        @Inject(AUDIT_REPOSITORY)
        private readonly auditRepository: IAuditRepository,
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(PRICING_REPOSITORY)
        private readonly pricingRepository: IPricingRepository,
        private readonly configService: ConfigService,
    ) { }

    async execute(input: CreateHoldInput): Promise<CreateHoldOutput> {
        const { userId, courtId, startTime, endTime } = input;

        // 1. Validate court exists
        const court = await this.courtRepository.findById(courtId);
        if (!court) {
            throw new CourtNotFoundError(courtId);
        }

        // 2. Validate time is within operating hours
        const operatingHours = await this.pricingRepository.findOperatingHoursByCourtId(courtId);
        const isWithinOperatingHours = this.validateOperatingHours(
            startTime,
            endTime,
            operatingHours,
        );
        if (!isWithinOperatingHours) {
            throw new OutsideOperatingHoursError();
        }

        // 3. Calculate price
        const totalPrice = await this.pricingRepository.calculatePrice(
            courtId,
            startTime,
            endTime,
        );

        // 4. Get TTL configuration
        const holdTtlMinutes = this.configService.get<number>('booking.holdTtlMinutes', 5);
        const holdTtlSeconds = holdTtlMinutes * 60;
        const holdExpiresAt = new Date(Date.now() + holdTtlSeconds * 1000);

        // 5. Try to acquire Redis lock first (optimistic concurrency)
        // This prevents race conditions before we even hit the database
        const tempBookingId = crypto.randomUUID();
        const acquired = await this.holdService.acquireHold(
            courtId,
            startTime,
            endTime,
            { bookingId: tempBookingId, userId },
            holdTtlSeconds,
        );

        if (!acquired) {
            throw new SlotConflictError(courtId, startTime, endTime);
        }

        try {
            // 6. Double-check database for conflicts (belt and suspenders)
            const conflicts = await this.bookingRepository.findConflicting({
                courtId,
                startTime,
                endTime,
            });

            const activeConflicts = conflicts.filter((b) =>
                BLOCKING_STATUSES.includes(b.status),
            );

            if (activeConflicts.length > 0) {
                // Release Redis lock since DB shows conflict
                await this.holdService.releaseHold(courtId, startTime, endTime);
                throw new SlotConflictError(courtId, startTime, endTime);
            }

            // 7. Create booking in HOLD status
            const booking = await this.bookingRepository.create({
                userId,
                courtId,
                startTime,
                endTime,
                status: BookingStatus.HOLD,
                holdExpiresAt,
                totalPrice,
            });

            // 8. Update Redis with actual booking ID
            await this.holdService.releaseHold(courtId, startTime, endTime);
            await this.holdService.acquireHold(
                courtId,
                startTime,
                endTime,
                { bookingId: booking.id, userId },
                holdTtlSeconds,
            );

            // 9. Create audit log
            await this.auditRepository.create({
                bookingId: booking.id,
                fromStatus: null,
                toStatus: BookingStatus.HOLD,
                actorType: ActorType.CUSTOMER,
                actorId: userId,
                note: 'Slot held by customer',
            });

            return {
                bookingId: booking.id,
                status: booking.status,
                holdExpiresAt,
                totalPrice,
            };
        } catch (error) {
            // Release Redis lock on any error
            await this.holdService.releaseHold(courtId, startTime, endTime);
            throw error;
        }
    }

    private validateOperatingHours(
        startTime: Date,
        endTime: Date,
        operatingHours: any[],
    ): boolean {
        if (operatingHours.length === 0) {
            return true; // No restrictions if no operating hours defined
        }

        const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][
            startTime.getUTCDay()
        ];

        const dayHours = operatingHours.find((h) => h.dayOfWeek === dayOfWeek);

        if (!dayHours || dayHours.isClosed) {
            return false;
        }

        const startTimeStr = startTime.toISOString().substring(11, 16);
        const endTimeStr = endTime.toISOString().substring(11, 16);

        return startTimeStr >= dayHours.openTime && endTimeStr <= dayHours.closeTime;
    }
}
