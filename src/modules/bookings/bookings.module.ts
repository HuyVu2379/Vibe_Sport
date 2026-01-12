// ===========================================
// MODULES - Bookings Module
// Wires dependencies via DI
// ===========================================

import { Module } from '@nestjs/common';
import { BookingsController, MyBookingsController } from '../../interfaces/http/bookings/bookings.controller';

import {
    BOOKING_REPOSITORY,
    HOLD_SERVICE,
    AUDIT_REPOSITORY,
    COURT_REPOSITORY,
    PRICING_REPOSITORY,
    USER_REPOSITORY,
} from '../../application/ports';

import {
    BookingRepository,
    HoldService,
    AuditRepository,
    CourtRepository,
    PricingRepository,
    UserRepository,
} from '../../infrastructure/repositories';

import {
    CreateHoldUseCase,
    ConfirmBookingUseCase,
    CancelBookingUseCase,
    GetMyBookingsUseCase,
    GetOwnerBookingsUseCase,
} from '../../application/use-cases/bookings';

@Module({
    controllers: [BookingsController, MyBookingsController],
    providers: [
        // Use Cases
        CreateHoldUseCase,
        ConfirmBookingUseCase,
        CancelBookingUseCase,
        GetMyBookingsUseCase,
        GetOwnerBookingsUseCase,

        // Repository implementations
        { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
        { provide: HOLD_SERVICE, useClass: HoldService },
        { provide: AUDIT_REPOSITORY, useClass: AuditRepository },
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
        { provide: PRICING_REPOSITORY, useClass: PricingRepository },
        { provide: USER_REPOSITORY, useClass: UserRepository },
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
