// ===========================================
// MODULES - Venues Module
// ===========================================

import { Module } from '@nestjs/common';
import { VenuesController } from '../../interfaces/http/venues/venues.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

// Ports
import { VENUE_REPOSITORY, VENUE_STAFF_REPOSITORY } from '../../application/ports';

// Use cases
import { SearchVenuesUseCase, GetVenueDetailUseCase } from '../../application/use-cases/venues';

// Infrastructure
import { VenueRepository, VenueStaffRepository } from '../../infrastructure/repositories';

@Module({
    imports: [PrismaModule],
    controllers: [VenuesController],
    providers: [
        // Use cases
        SearchVenuesUseCase,
        GetVenueDetailUseCase,

        // Repository implementations
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
        { provide: VENUE_STAFF_REPOSITORY, useClass: VenueStaffRepository },
    ],
    exports: [VENUE_REPOSITORY, VENUE_STAFF_REPOSITORY],
})
export class VenuesModule { }
