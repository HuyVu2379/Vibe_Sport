// Quy tắc hoàn tiền khi hủy booking
export enum RefundRule {
    FULL = 'FULL', // Hoàn tiền 100% nếu hủy trước thời gian quy định
    PARTIAL = 'PARTIAL', // Hoàn tiền một phần (ví dụ 50%) nếu hủy trước thời gian quy định
    NONE = 'NONE', // Không hoàn tiền nếu hủy booking
}
// Option đặt cọc
export enum DepositType {
    NONE = 'NONE', // Không yêu cầu đặt cọc
    PERCENTAGE = 'PERCENT', // Đặt cọc theo phần trăm tổng giá trị booking
    FULL = 'FULL', // Thanh toán toàn bộ ngay khi đặt booking
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
