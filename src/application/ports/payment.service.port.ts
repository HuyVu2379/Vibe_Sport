export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');

export interface CreatePaymentLinkParams {
    bookingId: string;
    amount: number;
    description: string;
    returnUrl?: string;
    cancelUrl?: string;
}

export interface PaymentLinkResponse {
    paymentUrl: string;
    orderCode: number;
}

export interface IPaymentService {
    createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse>;
    verifyWebhook(webhookData: any): Promise<boolean>;
    getPaymentStatus(orderCode: number): Promise<string>;
}
