import { Module, Global } from '@nestjs/common';
import { PaymentsController } from '../../interfaces/http/payments/payments.controller';
import { PayosService } from '../../infrastructure/notifications/payos.service';
import { PAYMENT_SERVICE } from '../../application/ports/payment.service.port';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { BookingsModule } from '../bookings/bookings.module';
import { ProcessPaymentWebhookUseCase } from '../../application/use-cases/payments/process-payment-webhook.use-case';

@Global()
@Module({
    imports: [PrismaModule, BookingsModule],
    controllers: [PaymentsController],
    providers: [
        ProcessPaymentWebhookUseCase,
        {
            provide: PAYMENT_SERVICE,
            useClass: PayosService,
        },
    ],
    exports: [PAYMENT_SERVICE],
})
export class PaymentsModule { }
