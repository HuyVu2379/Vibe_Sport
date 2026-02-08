// ===========================================
// APPLICATION LAYER - Conversation Repository Port
// ===========================================

import {
    Conversation,
    ConversationType,
    Message,
    MessageType,
} from '../../domain/entities/conversation.entity';

export interface CreateConversationData {
    type: ConversationType;
    bookingId?: string;
    venueId?: string;
    participantIds: string[];
}

export interface CreateMessageData {
    conversationId: string;
    senderId: string;
    content: string;
    type?: MessageType;
}

export interface IConversationRepository {
    create(data: CreateConversationData): Promise<Conversation>;
    findById(id: string): Promise<Conversation | null>;
    findByUserIdWithDetails(userId: string, page: number, size: number): Promise<{ items: Conversation[]; total: number }>;
    findOrCreateBookingChat(bookingId: string, participantIds: string[]): Promise<Conversation>;
    findOrCreateVenueInquiry(venueId: string, customerId: string, ownerId: string): Promise<Conversation>;
    createMessage(data: CreateMessageData): Promise<Message>;
    findMessages(conversationId: string, page: number, size: number): Promise<{ items: Message[]; total: number }>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    isParticipant(conversationId: string, userId: string): Promise<boolean>;
}

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');
