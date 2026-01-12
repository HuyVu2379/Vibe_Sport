// ===========================================
// DOMAIN LAYER - Booking Entity
// Framework-agnostic domain model
// ===========================================

import { BookingStatus } from './booking-status.enum';

export interface BookingProps {
    id: string;
    userId: string;
    courtId: string;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    holdExpiresAt?: Date;
    totalPrice: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Booking {
    private readonly props: BookingProps;

    constructor(props: BookingProps) {
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }

    get userId(): string {
        return this.props.userId;
    }

    get courtId(): string {
        return this.props.courtId;
    }

    get startTime(): Date {
        return this.props.startTime;
    }

    get endTime(): Date {
        return this.props.endTime;
    }

    get status(): BookingStatus {
        return this.props.status;
    }

    get holdExpiresAt(): Date | undefined {
        return this.props.holdExpiresAt;
    }

    get totalPrice(): number {
        return this.props.totalPrice;
    }

    get note(): string | undefined {
        return this.props.note;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Domain Logic

    isHoldExpired(): boolean {
        if (this.status !== BookingStatus.HOLD || !this.holdExpiresAt) {
            return false;
        }
        return new Date() > this.holdExpiresAt;
    }

    canConfirm(): boolean {
        return this.status === BookingStatus.HOLD && !this.isHoldExpired();
    }

    canCancel(): boolean {
        return this.status === BookingStatus.CONFIRMED;
    }

    canComplete(): boolean {
        return this.status === BookingStatus.CONFIRMED && new Date() > this.endTime;
    }

    toProps(): BookingProps {
        return { ...this.props };
    }
}
