export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';

export enum NotificationType {
    BOOKING_CREATED = 'BOOKING_CREATED',
    BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    BOOKING_REMINDER = 'BOOKING_REMINDER',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    PROMOTION = 'PROMOTION',
}

export interface SendNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
}

export interface INotificationService {
    send(params: SendNotificationParams): Promise<void>;
    sendToUser(userId: string, type: NotificationType, title: string, message: string): Promise<void>;
}
