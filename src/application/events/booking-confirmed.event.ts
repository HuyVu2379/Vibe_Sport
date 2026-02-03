export class BookingConfirmedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly courtName: string,
        public readonly startTime: Date,
    ) { }
}
