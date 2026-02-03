import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ISocketService, SOCKET_SERVICE } from '../../application/ports/socket.service.port';
import {
    INotificationService,
    SendNotificationParams,
    NotificationType,
} from '../../application/ports/notification.service.port';

@Injectable()
export class NotificationService implements INotificationService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(SOCKET_SERVICE)
        private readonly socketService: ISocketService,
    ) { }

    async send(params: SendNotificationParams): Promise<void> {
        const notification = await this.prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type as any,
                title: params.title,
                message: params.message,
            },
        });

        this.socketService.emitToUser(params.userId, 'notification.new', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
            read: false,
        });
    }

    async sendToUser(userId: string, type: NotificationType, title: string, message: string): Promise<void> {
        await this.send({ userId, type, title, message });
    }
}
