// ===========================================
// MODULES - Owner Module
// ===========================================

import { Module } from '@nestjs/common';
import { OwnerBookingsController } from '../../interfaces/http/owner/owner.controller';
import { BookingsModule } from '../bookings/bookings.module';
import {
    COURT_REPOSITORY,
    VENUE_REPOSITORY,
    USER_REPOSITORY,
} from '../../application/ports';
import {
    CourtRepository,
    VenueRepository,
    UserRepository,
} from '../../infrastructure/repositories';

@Module({
    imports: [BookingsModule],
    controllers: [OwnerBookingsController],
    providers: [
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
        { provide: USER_REPOSITORY, useClass: UserRepository },
    ],
})
export class OwnerModule { }
