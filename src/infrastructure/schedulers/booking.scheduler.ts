// ===========================================
// INFRASTRUCTURE LAYER - Booking Scheduler
// Periodic tasks for release slot business rules
//
// BR-REL-02: Expire stale HOLD bookings (every minute)
// BR-REL-07: Complete finished bookings (every 5 minutes)
// BR-REL-08: Reconcile ghost holds on startup & periodically
// ===========================================

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ExpireHoldsUseCase } from '../../application/use-cases/bookings/expire-holds.use-case';
import { CompleteBookingsUseCase } from '../../application/use-cases/bookings/complete-bookings.use-case';

@Injectable()
export class BookingSchedulerService implements OnModuleInit {
    constructor(
        private readonly expireHoldsUseCase: ExpireHoldsUseCase,
        private readonly completeBookingsUseCase: CompleteBookingsUseCase,
        @InjectPinoLogger(BookingSchedulerService.name)
        private readonly logger: PinoLogger,
    ) { }

    /**
     * BR-REL-08: On application startup, run reconciliation
     * to clean up any ghost holds from a previous crash/restart.
     */
    async onModuleInit(): Promise<void> {
        this.logger.info('BookingScheduler: Running startup reconciliation (BR-REL-08)...');
        try {
            const reconciledCount = await this.expireHoldsUseCase.reconcileHolds();
            this.logger.info(`BookingScheduler: Startup reconciliation complete. Reconciled ${reconciledCount} ghost holds.`);
        } catch (error) {
            this.logger.error({ error }, 'BookingScheduler: Startup reconciliation failed');
        }
    }

    /**
     * BR-REL-02: Expire stale HOLD bookings every minute.
     * Redis TTL handles the primary expiration, but this syncs PostgreSQL
     * for any holds whose TTL has passed but DB status wasn't updated.
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpireHolds(): Promise<void> {
        try {
            const expiredCount = await this.expireHoldsUseCase.expireHolds();
            if (expiredCount > 0) {
                this.logger.info(`Scheduler [BR-REL-02]: Expired ${expiredCount} stale holds`);
            }
        } catch (error) {
            this.logger.error({ error }, 'Scheduler [BR-REL-02]: Failed to expire holds');
        }
    }

    /**
     * BR-REL-07: Complete finished bookings every 5 minutes.
     * Marks CONFIRMED bookings as COMPLETED when endTime has passed.
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCompleteBookings(): Promise<void> {
        try {
            const { completedCount } = await this.completeBookingsUseCase.execute();
            if (completedCount > 0) {
                this.logger.info(`Scheduler [BR-REL-07]: Completed ${completedCount} bookings`);
            }
        } catch (error) {
            this.logger.error({ error }, 'Scheduler [BR-REL-07]: Failed to complete bookings');
        }
    }

    /**
     * BR-REL-08: Periodic reconciliation every 10 minutes.
     * Detects and cleans up ghost holds (HOLD in DB but Redis key gone).
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleReconcileHolds(): Promise<void> {
        try {
            const reconciledCount = await this.expireHoldsUseCase.reconcileHolds();
            if (reconciledCount > 0) {
                this.logger.warn(
                    `Scheduler [BR-REL-08]: Reconciled ${reconciledCount} ghost holds`,
                );
            }
        } catch (error) {
            this.logger.error({ error }, 'Scheduler [BR-REL-08]: Failed to reconcile holds');
        }
    }
}
