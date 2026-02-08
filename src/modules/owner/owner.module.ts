// ===========================================
// MODULES - Owner Module
// ===========================================

import { Module } from '@nestjs/common';
import { OwnerBookingsController } from '../../interfaces/http/owner/owner.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { VenuesModule } from '../venues/venues.module';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

import {
    COURT_REPOSITORY,
    VENUE_REPOSITORY,
    USER_REPOSITORY,
    VENUE_STAFF_REPOSITORY,
    ANALYTICS_REPOSITORY,
} from '../../application/ports';
import {
    CourtRepository,
    VenueRepository,
    UserRepository,
    VenueStaffRepository,
} from '../../infrastructure/repositories';
import { AnalyticsRepository } from '../../infrastructure/repositories/analytics.repository';

// Use cases
import { GetVenueAnalyticsUseCase } from '../../application/use-cases/analytics';

@Module({
    imports: [BookingsModule, VenuesModule, PrismaModule],
    controllers: [OwnerBookingsController],
    providers: [
        // Use cases
        GetVenueAnalyticsUseCase,

        // Repository implementations
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
        { provide: USER_REPOSITORY, useClass: UserRepository },
        { provide: VENUE_STAFF_REPOSITORY, useClass: VenueStaffRepository },
        { provide: ANALYTICS_REPOSITORY, useClass: AnalyticsRepository },
    ],
})
export class OwnerModule { }
