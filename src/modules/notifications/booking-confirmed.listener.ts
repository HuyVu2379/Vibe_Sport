import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingConfirmedEvent } from '../../application/events/booking-confirmed.event';
import {
    INotificationService,
    NOTIFICATION_SERVICE,
    NotificationType,
} from '../../application/ports/notification.service.port';

@Injectable()
export class BookingConfirmedListener {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
    ) { }

    @OnEvent('booking.confirmed')
    async handleBookingConfirmedEvent(event: BookingConfirmedEvent) {
        const message = `Booking của bạn tại sân ${event.courtName} lúc ${event.startTime.toLocaleString()} đã được xác nhận.`;
        await this.notificationService.sendToUser(
            event.userId,
            NotificationType.BOOKING_CONFIRMED,
            'Xác nhận đặt sân',
            message,
        );
    }
}
