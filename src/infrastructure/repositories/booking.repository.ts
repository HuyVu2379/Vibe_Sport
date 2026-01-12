// ===========================================
// INFRASTRUCTURE LAYER - Booking Repository
// Prisma implementation
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    IBookingRepository,
    CreateBookingData,
    UpdateBookingData,
    FindConflictingBookingsParams,
    FindBookingsParams,
    PaginatedResult,
} from '../../application/ports/booking.repository.port';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingStatus, BLOCKING_STATUSES } from '../../domain/entities/booking-status.enum';

@Injectable()
export class BookingRepository implements IBookingRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateBookingData): Promise<Booking> {
        const booking = await this.prisma.booking.create({
            data: {
                userId: data.userId,
                courtId: data.courtId,
                startTime: data.startTime,
                endTime: data.endTime,
                status: data.status,
                holdExpiresAt: data.holdExpiresAt,
                totalPrice: data.totalPrice,
                note: data.note,
            },
        });

        return this.mapToDomain(booking);
    }

    async findById(id: string): Promise<Booking | null> {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
        });

        return booking ? this.mapToDomain(booking) : null;
    }

    async findByIdWithLock(id: string): Promise<Booking | null> {
        // Use raw query for SELECT FOR UPDATE
        const bookings = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM bookings WHERE id = ${id} FOR UPDATE
    `;

        return bookings.length > 0 ? this.mapToDomain(bookings[0]) : null;
    }

    async update(id: string, data: UpdateBookingData): Promise<Booking> {
        const booking = await this.prisma.booking.update({
            where: { id },
            data: {
                status: data.status,
                note: data.note,
            },
        });

        return this.mapToDomain(booking);
    }

    async findConflicting(params: FindConflictingBookingsParams): Promise<Booking[]> {
        const { courtId, startTime, endTime, excludeBookingId } = params;

        const bookings = await this.prisma.booking.findMany({
            where: {
                courtId,
                status: { in: BLOCKING_STATUSES },
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                OR: [
                    {
                        // New booking starts during existing booking
                        startTime: { lte: startTime },
                        endTime: { gt: startTime },
                    },
                    {
                        // New booking ends during existing booking
                        startTime: { lt: endTime },
                        endTime: { gte: endTime },
                    },
                    {
                        // New booking contains existing booking
                        startTime: { gte: startTime },
                        endTime: { lte: endTime },
                    },
                ],
            },
        });

        return bookings.map(this.mapToDomain);
    }

    async findMany(params: FindBookingsParams): Promise<PaginatedResult<Booking>> {
        const { userId, courtId, status, from, to, page = 0, size = 10 } = params;

        const where: any = {};

        if (userId) where.userId = userId;
        if (courtId) where.courtId = courtId;
        if (status) {
            where.status = Array.isArray(status) ? { in: status } : status;
        }
        if (from || to) {
            where.startTime = {};
            if (from) where.startTime.gte = from;
            if (to) where.startTime.lte = to;
        }

        const [items, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip: page * size,
                take: size,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            items: items.map(this.mapToDomain),
            page,
            size,
            total,
        };
    }

    async findByUserIdAndCourtIds(
        userId: string,
        courtIds: string[],
    ): Promise<PaginatedResult<Booking>> {
        const where = {
            userId,
            courtId: { in: courtIds },
        };

        const [items, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            items: items.map(this.mapToDomain),
            page: 0,
            size: items.length,
            total,
        };
    }

    async expireHolds(): Promise<number> {
        const result = await this.prisma.booking.updateMany({
            where: {
                status: BookingStatus.HOLD,
                holdExpiresAt: { lte: new Date() },
            },
            data: {
                status: BookingStatus.EXPIRED,
            },
        });

        return result.count;
    }

    private mapToDomain(record: any): Booking {
        return new Booking({
            id: record.id,
            userId: record.userId || record.user_id,
            courtId: record.courtId || record.court_id,
            startTime: new Date(record.startTime || record.start_time),
            endTime: new Date(record.endTime || record.end_time),
            status: record.status as BookingStatus,
            holdExpiresAt: record.holdExpiresAt || record.hold_expires_at
                ? new Date(record.holdExpiresAt || record.hold_expires_at)
                : undefined,
            totalPrice: Number(record.totalPrice || record.total_price),
            note: record.note,
            createdAt: new Date(record.createdAt || record.created_at),
            updatedAt: new Date(record.updatedAt || record.updated_at),
        });
    }
}
