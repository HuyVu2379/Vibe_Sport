// ===========================================
// APPLICATION LAYER - Get My Bookings Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
    PaginatedResult,
} from '../../ports/booking.repository.port';
import { Booking } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';

export interface GetMyBookingsInput {
    userId: string;
    status?: BookingStatus;
    from?: Date;
    to?: Date;
    page?: number;
    size?: number;
}

export interface BookingListItem {
    bookingId: string;
    status: BookingStatus;
    courtId: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    createdAt: Date;
}

export interface GetMyBookingsOutput {
    items: BookingListItem[];
    page: number;
    size: number;
    total: number;
}

@Injectable()
export class GetMyBookingsUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
    ) { }

    async execute(input: GetMyBookingsInput): Promise<GetMyBookingsOutput> {
        const { userId, status, from, to, page = 0, size = 10 } = input;

        const result = await this.bookingRepository.findMany({
            userId,
            status,
            from,
            to,
            page,
            size,
        });

        return {
            items: result.items.map((booking) => ({
                bookingId: booking.id,
                status: booking.status,
                courtId: booking.courtId,
                startTime: booking.startTime,
                endTime: booking.endTime,
                totalPrice: booking.totalPrice,
                createdAt: booking.createdAt,
            })),
            page: result.page,
            size: result.size,
            total: result.total,
        };
    }
}
