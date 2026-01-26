import { Controller, Post, Body, Get, Query, Inject } from '@nestjs/common';
import {
    PAYMENT_SERVICE,
    IPaymentService,
} from '../../../application/ports/payment.service.port';
import {
    IBookingRepository,
    BOOKING_REPOSITORY,
} from '../../../application/ports/booking.repository.port';
import { BookingStatus } from '../../../domain/entities/booking-status.enum';
import { ProcessPaymentWebhookUseCase } from '../../../application/use-cases/payments/process-payment-webhook.use-case';

@Controller('payments')
export class PaymentsController {
    constructor(
        @Inject(PAYMENT_SERVICE)
        private readonly paymentService: IPaymentService,
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        private readonly processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase,
    ) { }

    @Post('webhook')
    async handleWebhook(@Body() body: any) {
        const isValid = await this.paymentService.verifyWebhook(body);
        if (!isValid) return { status: 'error', message: 'Invalid signature' };

        const { orderCode, success } = body.data;

        if (success) {
            console.log(`Payment success for order ${body.data.orderCode}`);
            await this.processPaymentWebhookUseCase.execute(body.data);
        }

        return { status: 'ok' };
    }

    @Get('callback')
    async handleCallback(@Query('orderCode') orderCode: string) {
        return { status: 'ok', message: 'Payment processed' };
    }
}
