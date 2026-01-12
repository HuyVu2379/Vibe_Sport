// ===========================================
// APPLICATION LAYER - Get Owner Bookings Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../ports/booking.repository.port';
import { ICourtRepository, COURT_REPOSITORY } from '../../ports/court.repository.port';
import { IUserRepository, USER_REPOSITORY } from '../../ports/user.repository.port';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';

export interface GetOwnerBookingsInput {
    ownerId: string;
    courtId?: string;
    status?: BookingStatus;
    from?: Date;
    to?: Date;
    page?: number;
    size?: number;
}

export interface OwnerBookingListItem {
    bookingId: string;
    status: BookingStatus;
    courtId: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    customer: {
        userId: string;
        fullName: string;
        phone?: string;
    };
    createdAt: Date;
}

export interface GetOwnerBookingsOutput {
    items: OwnerBookingListItem[];
    page: number;
    size: number;
    total: number;
}

@Injectable()
export class GetOwnerBookingsUseCase {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(COURT_REPOSITORY)
        private readonly courtRepository: ICourtRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: GetOwnerBookingsInput): Promise<GetOwnerBookingsOutput> {
        const { ownerId, courtId, status, from, to, page = 0, size = 10 } = input;

        // Get all courts owned by this owner
        const ownerCourts = await this.courtRepository.findByOwnerId(ownerId);
        const courtIds = courtId
            ? [courtId]
            : ownerCourts.map((c) => c.id);

        if (courtIds.length === 0) {
            return { items: [], page, size, total: 0 };
        }

        // Get bookings for owner's courts
        const result = await this.bookingRepository.findMany({
            courtId: courtIds[0], // TODO: Support multiple court IDs
            status,
            from,
            to,
            page,
            size,
        });

        // Enrich with customer data
        const items: OwnerBookingListItem[] = await Promise.all(
            result.items.map(async (booking) => {
                const customer = await this.userRepository.findById(booking.userId);
                return {
                    bookingId: booking.id,
                    status: booking.status,
                    courtId: booking.courtId,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    totalPrice: booking.totalPrice,
                    customer: {
                        userId: customer?.id || '',
                        fullName: customer?.fullName || 'Unknown',
                        phone: customer?.phone,
                    },
                    createdAt: booking.createdAt,
                };
            }),
        );

        return {
            items,
            page: result.page,
            size: result.size,
            total: result.total,
        };
    }
}
