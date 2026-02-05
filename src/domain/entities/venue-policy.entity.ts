export enum RefundRule {
    FULL = 'FULL',
    PARTIAL = 'PARTIAL',
    NONE = 'NONE',
}

export enum DepositType {
    NONE = 'NONE',
    PERCENTAGE = 'PERCENTAGE',
    FULL = 'FULL',
}

export class VenuePolicy {
    constructor(
        public readonly id: string,
        public readonly venueId: string,
        public readonly holdTTL: number,
        public readonly allowExtendHold: boolean,
        public readonly cancelBeforeHours: number,
        public readonly refundRule: RefundRule,
        public readonly depositType: DepositType,
        public readonly depositValue: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static createDefault(venueId: string): VenuePolicy {
        return new VenuePolicy(
            '',
            venueId,
            10,
            false,
            24,
            RefundRule.FULL,
            DepositType.NONE,
            0,
            new Date(),
            new Date(),
        );
    }
}
