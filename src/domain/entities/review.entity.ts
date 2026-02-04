// ===========================================
// DOMAIN ENTITY - Review
// ===========================================

export class Review {
    constructor(
        public readonly id: string,
        public readonly bookingId: string,
        public readonly venueId: string,
        public readonly userId: string,
        public readonly rating: number,
        public readonly comment: string | null,
        public readonly reply: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    isValidRating(): boolean {
        return this.rating >= 1 && this.rating <= 5;
    }

    hasReply(): boolean {
        return this.reply !== null && this.reply.length > 0;
    }
}
