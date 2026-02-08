// ===========================================
// MODULES - Venues Module
// ===========================================

import { Module } from '@nestjs/common';
import { VenuesController } from '../../interfaces/http/venues/venues.controller';
import { VENUE_REPOSITORY, VENUE_STAFF_REPOSITORY } from '../../application/ports';
import { VenueRepository, VenueStaffRepository } from '../../infrastructure/repositories';
import { VenueMapper } from '../../application/mappers/venue.mapper';

@Module({
    controllers: [VenuesController],
    providers: [
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
        { provide: VENUE_STAFF_REPOSITORY, useClass: VenueStaffRepository },
        VenueMapper,
    ],
    exports: [VENUE_REPOSITORY, VENUE_STAFF_REPOSITORY],
})
export class VenuesModule { }

