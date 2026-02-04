// ===========================================
// MODULES - Bookings Module
// Wires dependencies via DI
// ===========================================

import { Module } from '@nestjs/common';
import { VenuesModule } from '../venues/venues.module';
import { BookingsController, MyBookingsController } from '../../interfaces/http/bookings/bookings.controller';

import {
    BOOKING_REPOSITORY,
    HOLD_SERVICE,
    AUDIT_REPOSITORY,
    COURT_REPOSITORY,
    PRICING_REPOSITORY,
    USER_REPOSITORY,
    RECURRING_REPOSITORY,
} from '../../application/ports';

import {
    BookingRepository,
    HoldService,
    AuditRepository,
    CourtRepository,
    PricingRepository,
    UserRepository,
    RecurringRepository,
} from '../../infrastructure/repositories';

import {
    CreateHoldUseCase,
    ConfirmBookingUseCase,
    CancelBookingUseCase,
    GetMyBookingsUseCase,
    GetOwnerBookingsUseCase,
    CreateRecurringBookingUseCase,
} from '../../application/use-cases/bookings';

@Module({
    imports: [VenuesModule],
    controllers: [BookingsController, MyBookingsController],
    providers: [
        // Use Cases
        CreateHoldUseCase,
        ConfirmBookingUseCase,
        CancelBookingUseCase,
        GetMyBookingsUseCase,
        GetOwnerBookingsUseCase,
        CreateRecurringBookingUseCase,

        // Repository implementations
        { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
        { provide: HOLD_SERVICE, useClass: HoldService },
        { provide: AUDIT_REPOSITORY, useClass: AuditRepository },
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: PRICING_REPOSITORY, useClass: PricingRepository },
        { provide: USER_REPOSITORY, useClass: UserRepository },
        { provide: RECURRING_REPOSITORY, useClass: RecurringRepository },
    ],
    exports: [
        BOOKING_REPOSITORY,
        HOLD_SERVICE,
        AUDIT_REPOSITORY,
        GetOwnerBookingsUseCase,
        CancelBookingUseCase,
    ],
})
export class BookingsModule { }
