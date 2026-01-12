// ===========================================
// MODULES - Venues Module
// ===========================================

import { Module } from '@nestjs/common';
import { VenuesController } from '../../interfaces/http/venues/venues.controller';
import { VENUE_REPOSITORY } from '../../application/ports';
import { VenueRepository } from '../../infrastructure/repositories';

@Module({
    controllers: [VenuesController],
    providers: [
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
    ],
    exports: [VENUE_REPOSITORY],
})
export class VenuesModule { }
