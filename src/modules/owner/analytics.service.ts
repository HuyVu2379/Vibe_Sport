import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BookingStatus } from '../../domain/entities/booking-status.enum';

export interface AnalyticsSummary {
    totalRevenue: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
}

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getVenueAnalytics(venueId: string, from: Date, to: Date): Promise<AnalyticsSummary> {
        const bookings = await this.prisma.booking.findMany({
            where: {
                court: { venueId },
                startTime: { gte: from, lte: to },
                status: {
                    in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED_BY_USER, BookingStatus.CANCELLED_BY_OWNER],
                },
            },
        });

        const totalRevenue = bookings
            .filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
            .reduce((sum, b) => sum + Number(b.totalPrice), 0);

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED).length;
        const cancelledBookings = bookings.filter((b) => b.status.startsWith('CANCELLED')).length;

        return {
            totalRevenue,
            totalBookings,
            completedBookings,
            cancelledBookings,
        };
    }
}
