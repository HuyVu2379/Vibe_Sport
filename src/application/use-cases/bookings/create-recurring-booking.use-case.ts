import { Inject, Injectable } from '@nestjs/common';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../ports/booking.repository.port';
import {
    IRecurringRepository,
    RECURRING_REPOSITORY,
} from '../../ports/recurring.repository.port';
import { ICourtRepository, COURT_REPOSITORY } from '../../ports/court.repository.port';
import { IPricingRepository, PRICING_REPOSITORY } from '../../ports/pricing.repository.port';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';
import { Booking } from '../../../domain/entities/booking.entity';
import { CourtNotFoundError } from '../../../domain/errors';

export interface CreateRecurringBookingInput {
    userId: string;
    courtId: string;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    dayOfWeek: string; // "MON", "TUE", etc.
    startDate: Date;
    endDate: Date;
}

@Injectable()
export class CreateRecurringBookingUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(RECURRING_REPOSITORY)
        private readonly recurringRepository: IRecurringRepository,
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(PRICING_REPOSITORY)
        private readonly pricingRepository: IPricingRepository,
    ) { }

    async execute(input: CreateRecurringBookingInput) {
        const { userId, courtId, startTime, endTime, dayOfWeek, startDate, endDate } = input;

        const court = await this.courtRepository.findById(courtId);
        if (!court) throw new CourtNotFoundError(courtId);

        const plan = await this.recurringRepository.createPlan({
            courtId,
            userId,
            startTime,
            endTime,
            dayOfWeek,
            startDate,
            endDate,
        });

        const bookings: Booking[] = [];
        let currentDate = new Date(startDate);
        const dayMap: Record<string, number> = {
            'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
        };
        const targetDay = dayMap[dayOfWeek];

        while (currentDate <= endDate) {
            if (currentDate.getUTCDay() === targetDay) {
                const [startHour, startMin] = startTime.split(':').map(Number);
                const [endHour, endMin] = endTime.split(':').map(Number);

                const bookingStart = new Date(currentDate);
                bookingStart.setUTCHours(startHour, startMin, 0, 0);

                const bookingEnd = new Date(currentDate);
                bookingEnd.setUTCHours(endHour, endMin, 0, 0);

                const totalPrice = await this.pricingRepository.calculatePrice(
                    courtId,
                    bookingStart,
                    bookingEnd,
                );

                const booking = await this.bookingRepository.create({
                    userId,
                    courtId,
                    startTime: bookingStart,
                    endTime: bookingEnd,
                    status: BookingStatus.CONFIRMED,
                    totalPrice,
                    note: `Recurring booking from plan ${plan.id}`,
                });
                bookings.push(booking);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { plan, bookings };
    }
}
