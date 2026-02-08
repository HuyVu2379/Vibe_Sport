// ===========================================
// APPLICATION LAYER - OTP Service Port
// ===========================================

export interface IOtpService {
    generateOtp(): string;
    storeOtp(userId: string, otp: string, purpose: string): Promise<void>;
    verifyOtp(userId: string, otp: string, purpose: string): Promise<void>;
}

export const OTP_SERVICE = Symbol('OTP_SERVICE');
