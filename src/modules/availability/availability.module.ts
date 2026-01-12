// ===========================================
// MODULES - Availability Module
// ===========================================

import { Module } from '@nestjs/common';
import { AvailabilityController } from '../../interfaces/http/availability/availability.controller';
import { AvailabilityService } from './availability.service';
import {
    COURT_REPOSITORY,
    PRICING_REPOSITORY,
    BOOKING_REPOSITORY,
} from '../../application/ports';
import {
    CourtRepository,
    PricingRepository,
    BookingRepository,
} from '../../infrastructure/repositories';

@Module({
    controllers: [AvailabilityController],
    providers: [
        AvailabilityService,
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: PRICING_REPOSITORY, useClass: PricingRepository },
        { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
    ],
    exports: [AvailabilityService],
})
export class AvailabilityModule { }
