import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../application/ports/booking.repository.port';
import {
    INotificationService,
    NOTIFICATION_SERVICE,
    NotificationType,
} from '../../application/ports/notification.service.port';
import { BookingStatus } from '../../domain/entities/booking-status.enum';

@Injectable()
export class ReminderService {
    private readonly logger = new Logger(ReminderService.name);

    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleBookingReminders() {
        this.logger.log('Checking for upcoming booking reminders...');

        const now = new Date();
        const sixtyMinutesFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const sixtyFiveMinutesFromNow = new Date(now.getTime() + 65 * 60 * 1000);

        const result = await this.bookingRepository.findMany({
            status: BookingStatus.CONFIRMED,
            from: sixtyMinutesFromNow,
            to: sixtyFiveMinutesFromNow,
        });

        for (const booking of result.items) {
            const message = `Nhắc nhở: Bạn có lịch chơi sân lúc ${booking.startTime.toLocaleTimeString()} hôm nay. Hẹn gặp bạn!`;
            await this.notificationService.sendToUser(
                booking.userId,
                NotificationType.BOOKING_REMINDER,
                'Nhắc nhở lịch đặt sân',
                message,
            );
            this.logger.log(`Sent reminder for booking ${booking.id} to user ${booking.userId}`);
        }
    }
}
