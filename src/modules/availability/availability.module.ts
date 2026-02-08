// ===========================================
// MODULES - Availability Module
// ===========================================

import { Module } from '@nestjs/common';
import { AvailabilityController } from '../../interfaces/http/availability/availability.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

// Use cases
import { GetAvailabilityUseCase } from '../../application/use-cases/availability';

// Ports
import {
    COURT_REPOSITORY,
    PRICING_REPOSITORY,
    BOOKING_REPOSITORY,
} from '../../application/ports';

// Infrastructure
import {
    CourtRepository,
    PricingRepository,
    BookingRepository,
} from '../../infrastructure/repositories';

@Module({
    imports: [PrismaModule],
    controllers: [AvailabilityController],
    providers: [
        // Use cases
        GetAvailabilityUseCase,

        // Repository implementations
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: PRICING_REPOSITORY, useClass: PricingRepository },
        { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
    ],
    exports: [GetAvailabilityUseCase],
})
export class AvailabilityModule { }
