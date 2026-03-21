import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const { PayOS } = require('@payos/node');
import {
    IPaymentService,
    CreatePaymentLinkParams,
    PaymentLinkResponse,
} from '../../application/ports/payment.service.port';

@Injectable()
export class PayosService implements IPaymentService {
    private readonly payos: any;

    constructor(private readonly configService: ConfigService) {
        const clientId = this.configService.get<string>('payos.clientId');
        const apiKey = this.configService.get<string>('payos.apiKey');
        const checksumKey = this.configService.get<string>('payos.checksumKey');

        if (clientId && apiKey && checksumKey) {
            this.payos = new PayOS(clientId, apiKey, checksumKey);
        }
    }

    async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
        if (!this.payos) {
            throw new InternalServerErrorException('PayOS is not configured');
        }

        try {
            const body = {
                orderCode: Number(String(Date.now()).slice(-6)),
                amount: params.amount,
                description: params.description,
                returnUrl: params.returnUrl || this.configService.get<string>('payos.returnUrl'),
                cancelUrl: params.cancelUrl || this.configService.get<string>('payos.cancelUrl'),
            };

            const paymentLinkRes = await this.payos.createPaymentLink(body);

            return {
                paymentUrl: paymentLinkRes.checkoutUrl,
                orderCode: body.orderCode,
            };
        } catch (error) {
            console.error('PayOS createPaymentLink error:', error);
            throw new InternalServerErrorException('Failed to create payment link');
        }
    }

    async verifyWebhook(webhookData: any): Promise<boolean> {
        if (!this.payos) return false;
        try {
            this.payos.verifyPaymentWebhookData(webhookData);
            return true;
        } catch {
            return false;
        }
    }

    async getPaymentStatus(orderCode: number): Promise<string> {
        if (!this.payos) return 'UNCONFIGURED';
        const order = await this.payos.getPaymentLinkInformation(orderCode);
        return order.status;
    }
}
