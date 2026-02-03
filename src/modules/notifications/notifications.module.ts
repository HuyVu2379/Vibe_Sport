import { Module, Global } from '@nestjs/common';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { NOTIFICATION_SERVICE } from '../../application/ports/notification.service.port';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { BookingConfirmedListener } from './booking-confirmed.listener';
import { ReminderService } from './reminder.service';
import { BookingsModule } from '../bookings/bookings.module';

@Global()
@Module({
    imports: [PrismaModule, BookingsModule],
    providers: [
        {
            provide: NOTIFICATION_SERVICE,
            useClass: NotificationService,
        },
        BookingConfirmedListener,
        ReminderService,
    ],
    exports: [NOTIFICATION_SERVICE],
})
export class NotificationsModule { }
