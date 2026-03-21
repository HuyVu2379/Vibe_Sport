export class BookingConfirmedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly courtName: string,
        public readonly startTime: Date,
    ) { }
}
export const SlotConfirmedEvent = {
    SLOT_RELEASED: "slot.released",
    SLOT_LOCKED: "slot.locked",
    SLOT_CANCELLED: "slot.cancelled",
    SLOT_CONFIRMED: "slot.confirmed",
    SLOT_UPDATED: "slot.updated",
}