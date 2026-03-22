import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import {
    IPaymentService,
    CreatePaymentLinkParams,
    PaymentLinkResponse,
} from '../../application/ports/payment.service.port';

@Injectable()
export class PayosService implements IPaymentService {
    private readonly payos: PayOS;

    constructor(private readonly configService: ConfigService) {
        const clientId = this.configService.get<string>('payos.clientId');
        const apiKey = this.configService.get<string>('payos.apiKey');
        const checksumKey = this.configService.get<string>('payos.checksumKey');

        if (clientId && apiKey && checksumKey) {
            this.payos = new PayOS({ clientId, apiKey, checksumKey });
        }
    }

    async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
        if (!this.payos) {
            throw new InternalServerErrorException('PayOS is not configured');
        }

        try {
            const returnUrl = params.returnUrl || this.configService.get<string>('payos.returnUrl');
            const cancelUrl = params.cancelUrl || this.configService.get<string>('payos.cancelUrl');

            if (!returnUrl || !cancelUrl) {
                throw new InternalServerErrorException('PayOS returnUrl or cancelUrl is missing');
            }

            const body = {
                orderCode: Number(String(Date.now()).slice(-6)),
                amount: params.amount,
                description: params.description,
                returnUrl,
                cancelUrl,
            };

            const paymentLinkRes = await this.payos.paymentRequests.create(body);

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
            await this.payos.webhooks.verify(webhookData);
            return true;
        } catch {
            return false;
        }
    }

    async getPaymentStatus(orderCode: number): Promise<string> {
        if (!this.payos) return 'UNCONFIGURED';
        try {
            const order = await this.payos.paymentRequests.get(orderCode);
            return order.status;
        } catch (error) {
            console.error('PayOS getPaymentStatus error:', error);
            return 'FAILED';
        }
    }
}
