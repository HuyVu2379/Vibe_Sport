// ===========================================
// INTERFACES LAYER - Payments Controller
// ===========================================

import { Controller, Post, Body, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { PAYMENT_SERVICE, IPaymentService } from '../../../application/ports/payment.service.port';
import { ProcessPaymentWebhookUseCase } from '../../../application/use-cases/payments/process-payment-webhook.use-case';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(
        @Inject(PAYMENT_SERVICE)
        private readonly paymentService: IPaymentService,
        private readonly processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase,
    ) { }

    @Post('webhook')
    @Public()
    @ApiOperation({ summary: 'Handle payment webhook from PayOS' })
    @ApiResponse({ status: 200, description: 'Webhook processed' })
    async handleWebhook(@Body() body: any) {
        const isValid = await this.paymentService.verifyWebhook(body);
        if (!isValid) {
            return { status: 'error', message: 'Invalid signature' };
        }

        const { success } = body.data;

        if (success) {
            console.log(`Payment success for order ${body.data.orderCode}`);
            await this.processPaymentWebhookUseCase.execute(body.data);
        }

        return { status: 'ok' };
    }

    @Get('callback')
    @Public()
    @ApiOperation({ summary: 'Payment callback redirect' })
    @ApiResponse({ status: 200, description: 'Payment processed' })
    async handleCallback(@Query('orderCode') orderCode: string) {
        return { status: 'ok', message: 'Payment processed' };
    }
}
