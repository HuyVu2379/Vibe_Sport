// ===========================================
// APPLICATION LAYER - Email Service Port
// ===========================================

export interface IEmailService {
    sendOtp(email: string, otp: string): Promise<void>;
    sendPasswordChangedNotification(email: string): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
