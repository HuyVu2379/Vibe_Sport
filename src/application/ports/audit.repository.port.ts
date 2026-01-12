// ===========================================
// APPLICATION LAYER - Audit Repository Port
// ===========================================

import { BookingStatus } from '../../domain/entities/booking-status.enum';

export enum ActorType {
    SYSTEM = 'SYSTEM',
    CUSTOMER = 'CUSTOMER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

export interface CreateAuditLogData {
    bookingId: string;
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    actorType: ActorType;
    actorId?: string;
    note?: string;
}

export interface AuditLog {
    id: string;
    bookingId: string;
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    actorType: ActorType;
    actorId?: string;
    note?: string;
    createdAt: Date;
}

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface IAuditRepository {
    create(data: CreateAuditLogData): Promise<AuditLog>;
    findByBookingId(bookingId: string): Promise<AuditLog[]>;
}
