// ===========================================
// MODULES - Availability Service
// Calculates slot availability based on operating hours, pricing, and bookings
// ===========================================

import { Injectable, Inject } from '@nestjs/common';
import {
    ICourtRepository,
    COURT_REPOSITORY,
    IPricingRepository,
    PRICING_REPOSITORY,
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../application/ports';
import { BookingStatus, BLOCKING_STATUSES } from '../../domain/entities/booking-status.enum';
import { CourtNotFoundError } from '../../domain/errors';

export interface Slot {
    startTime: Date;
    endTime: Date;
    status: 'AVAILABLE' | 'UNAVAILABLE';
    price?: number;
}

@Injectable()
export class AvailabilityService {
    constructor(
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(PRICING_REPOSITORY)
        private readonly pricingRepository: IPricingRepository,
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
    ) { }

    async getAvailability(courtId: string, date: Date): Promise<Slot[]> {
        // 1. Verify court exists
        const court = await this.courtRepository.findById(courtId);
        if (!court) {
            throw new CourtNotFoundError(courtId);
        }

        // 2. Get operating hours for the day
        const operatingHours = await this.pricingRepository.findOperatingHoursByCourtId(courtId);
        const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getUTCDay()];
        const dayHours = operatingHours.find((h) => h.dayOfWeek === dayOfWeek);

        if (!dayHours || dayHours.isClosed) {
            return []; // Court is closed on this day
        }

        // 3. Get pricing rules
        const pricingRules = await this.pricingRepository.findPricingRulesByCourtId(courtId);
        const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
        const dayType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

        // 4. Generate hourly slots based on operating hours
        const slots: Slot[] = [];
        const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // 5. Get existing bookings for the day
        const bookings = await this.bookingRepository.findConflicting({
            courtId,
            startTime: startOfDay,
            endTime: endOfDay,
        });

        const activeBookings = bookings.filter((b) => BLOCKING_STATUSES.includes(b.status));

        // 6. Generate slots (hourly)
        for (let hour = openHour; hour < closeHour; hour++) {
            const slotStart = new Date(date);
            slotStart.setUTCHours(hour, 0, 0, 0);

            const slotEnd = new Date(date);
            slotEnd.setUTCHours(hour + 1, 0, 0, 0);

            // Check if slot overlaps with any booking
            const isBooked = activeBookings.some(
                (booking) =>
                    slotStart < booking.endTime && slotEnd > booking.startTime,
            );

            // Calculate price for slot
            const slotTimeStr = `${String(hour).padStart(2, '0')}:00`;
            const applicableRule = pricingRules.find(
                (r) =>
                    r.dayType === dayType &&
                    r.startTime <= slotTimeStr &&
                    r.endTime > slotTimeStr,
            );

            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                status: isBooked ? 'UNAVAILABLE' : 'AVAILABLE',
                price: isBooked ? undefined : applicableRule?.pricePerHour || 100000,
            });
        }

        return slots;
    }
}
