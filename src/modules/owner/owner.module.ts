// ===========================================
// MODULES - Owner Module
// ===========================================

import { Module } from '@nestjs/common';
import { OwnerBookingsController } from '../../interfaces/http/owner/owner.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { VenuesModule } from '../venues/venues.module';
import {
    COURT_REPOSITORY,
    VENUE_REPOSITORY,
    USER_REPOSITORY,
    VENUE_STAFF_REPOSITORY,
} from '../../application/ports';
import {
    CourtRepository,
    VenueRepository,
    UserRepository,
    VenueStaffRepository,
} from '../../infrastructure/repositories';
import { AnalyticsService } from './analytics.service';

@Module({
    imports: [BookingsModule, VenuesModule],
    controllers: [OwnerBookingsController],
    providers: [
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
        { provide: USER_REPOSITORY, useClass: UserRepository },
        { provide: VENUE_STAFF_REPOSITORY, useClass: VenueStaffRepository },
        AnalyticsService,
    ],
})
export class OwnerModule { }
