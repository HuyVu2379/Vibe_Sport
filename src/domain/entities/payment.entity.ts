// ===========================================
// DOMAIN ENTITY - Payment
// ===========================================

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    E_WALLET = 'E_WALLET',
    CREDIT_CARD = 'CREDIT_CARD',
}

export class Payment {
    constructor(
        public readonly id: string,
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly amount: number,
        public readonly currency: string,
        public readonly method: PaymentMethod,
        public readonly status: PaymentStatus,
        public readonly transactionId: string | null,
        public readonly gatewayResponse: Record<string, any> | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    isCompleted(): boolean {
        return this.status === PaymentStatus.COMPLETED;
    }

    isPending(): boolean {
        return this.status === PaymentStatus.PENDING;
    }

    canRefund(): boolean {
        return this.status === PaymentStatus.COMPLETED;
    }
}
