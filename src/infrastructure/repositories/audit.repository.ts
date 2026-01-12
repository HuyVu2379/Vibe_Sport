// ===========================================
// INFRASTRUCTURE LAYER - Audit Repository
// Prisma implementation
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    IAuditRepository,
    CreateAuditLogData,
    AuditLog,
    ActorType,
} from '../../application/ports/audit.repository.port';
import { BookingStatus } from '../../domain/entities/booking-status.enum';

@Injectable()
export class AuditRepository implements IAuditRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateAuditLogData): Promise<AuditLog> {
        const auditLog = await this.prisma.bookingAuditLog.create({
            data: {
                bookingId: data.bookingId,
                fromStatus: data.fromStatus,
                toStatus: data.toStatus,
                actorType: data.actorType,
                actorId: data.actorId,
                note: data.note,
            },
        });

        return this.mapToDomain(auditLog);
    }

    async findByBookingId(bookingId: string): Promise<AuditLog[]> {
        const auditLogs = await this.prisma.bookingAuditLog.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'asc' },
        });

        return auditLogs.map(this.mapToDomain);
    }

    private mapToDomain(record: any): AuditLog {
        return {
            id: record.id,
            bookingId: record.bookingId,
            fromStatus: record.fromStatus as BookingStatus | null,
            toStatus: record.toStatus as BookingStatus,
            actorType: record.actorType as ActorType,
            actorId: record.actorId,
            note: record.note,
            createdAt: record.createdAt,
        };
    }
}
