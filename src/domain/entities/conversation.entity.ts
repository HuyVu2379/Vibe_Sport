// ===========================================
// DOMAIN ENTITY - Conversation & Message
// ===========================================

export enum ConversationType {
    BOOKING = 'BOOKING',
    VENUE_INQUIRY = 'VENUE_INQUIRY',
    SUPPORT = 'SUPPORT',
}

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    SYSTEM = 'SYSTEM',
}

export class Conversation {
    constructor(
        public readonly id: string,
        public readonly type: ConversationType,
        public readonly bookingId: string | null,
        public readonly venueId: string | null,
        public readonly lastMessage: string | null,
        public readonly lastMessageAt: Date | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly participants?: Participant[],
        public readonly messages?: Message[],
    ) { }

    isBookingChat(): boolean {
        return this.type === ConversationType.BOOKING && this.bookingId !== null;
    }

    isVenueInquiry(): boolean {
        return this.type === ConversationType.VENUE_INQUIRY && this.venueId !== null;
    }
}

export class Participant {
    constructor(
        public readonly id: string,
        public readonly conversationId: string,
        public readonly userId: string,
        public readonly lastReadAt: Date | null,
        public readonly createdAt: Date,
    ) { }

    hasUnreadMessages(lastMessageAt: Date | null): boolean {
        if (!lastMessageAt) return false;
        if (!this.lastReadAt) return true;
        return this.lastReadAt < lastMessageAt;
    }
}

export class Message {
    constructor(
        public readonly id: string,
        public readonly conversationId: string,
        public readonly senderId: string,
        public readonly content: string,
        public readonly type: MessageType,
        public readonly createdAt: Date,
    ) { }

    isSystemMessage(): boolean {
        return this.type === MessageType.SYSTEM;
    }
}
