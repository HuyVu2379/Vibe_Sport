// ===========================================
// INFRASTRUCTURE - Conversation Repository
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    Conversation,
    ConversationType,
    Message,
    MessageType,
    Participant,
} from '../../domain/entities/conversation.entity';
import {
    IConversationRepository,
    CreateConversationData,
    CreateMessageData,
} from '../../application/ports/conversation.repository.port';

@Injectable()
export class ConversationRepository implements IConversationRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateConversationData): Promise<Conversation> {
        const conversation = await this.prisma.conversation.create({
            data: {
                type: data.type,
                bookingId: data.bookingId,
                venueId: data.venueId,
                participants: {
                    create: data.participantIds.map((userId) => ({ userId })),
                },
            },
            include: {
                participants: true,
            },
        });

        return this.mapToDomain(conversation);
    }

    async findById(id: string): Promise<Conversation | null> {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
            include: {
                participants: true,
            },
        });

        return conversation ? this.mapToDomain(conversation) : null;
    }

    async findByUserIdWithDetails(
        userId: string,
        page = 0,
        size = 20,
    ): Promise<{ items: Conversation[]; total: number }> {
        const [conversations, total] = await Promise.all([
            this.prisma.conversation.findMany({
                where: {
                    participants: {
                        some: { userId },
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: { id: true, fullName: true },
                            },
                        },
                    },
                    venue: {
                        select: { id: true, name: true },
                    },
                    booking: {
                        select: { id: true, startTime: true },
                    },
                },
                orderBy: { lastMessageAt: 'desc' },
                skip: page * size,
                take: size,
            }),
            this.prisma.conversation.count({
                where: {
                    participants: {
                        some: { userId },
                    },
                },
            }),
        ]);

        return {
            items: conversations.map((c) => this.mapToDomain(c)),
            total,
        };
    }

    async findOrCreateBookingChat(
        bookingId: string,
        participantIds: string[],
    ): Promise<Conversation> {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                type: 'BOOKING',
                bookingId,
            },
            include: { participants: true },
        });

        if (existing) {
            return this.mapToDomain(existing);
        }

        return this.create({
            type: ConversationType.BOOKING,
            bookingId,
            participantIds,
        });
    }

    async findOrCreateVenueInquiry(
        venueId: string,
        customerId: string,
        ownerId: string,
    ): Promise<Conversation> {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                type: 'VENUE_INQUIRY',
                venueId,
                participants: {
                    some: { userId: customerId },
                },
            },
            include: { participants: true },
        });

        if (existing) {
            return this.mapToDomain(existing);
        }

        return this.create({
            type: ConversationType.VENUE_INQUIRY,
            venueId,
            participantIds: [customerId, ownerId],
        });
    }

    // Message operations
    async createMessage(data: CreateMessageData): Promise<Message> {
        const message = await this.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                senderId: data.senderId,
                content: data.content,
                type: data.type || 'TEXT',
            },
        });

        // Update conversation last message
        await this.prisma.conversation.update({
            where: { id: data.conversationId },
            data: {
                lastMessage: data.content.substring(0, 100),
                lastMessageAt: new Date(),
            },
        });

        return this.mapMessageToDomain(message);
    }

    async findMessages(
        conversationId: string,
        page = 0,
        size = 50,
    ): Promise<{ items: Message[]; total: number }> {
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                skip: page * size,
                take: size,
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);

        return {
            items: messages.map((m) => this.mapMessageToDomain(m)),
            total,
        };
    }

    async markAsRead(conversationId: string, userId: string): Promise<void> {
        await this.prisma.participant.updateMany({
            where: { conversationId, userId },
            data: { lastReadAt: new Date() },
        });
    }

    async isParticipant(conversationId: string, userId: string): Promise<boolean> {
        const count = await this.prisma.participant.count({
            where: { conversationId, userId },
        });

        return count > 0;
    }

    private mapToDomain(record: any): Conversation {
        return new Conversation(
            record.id,
            record.type as ConversationType,
            record.bookingId,
            record.venueId,
            record.lastMessage,
            record.lastMessageAt,
            record.createdAt,
            record.updatedAt,
            record.participants?.map((p: any) => this.mapParticipantToDomain(p)),
            record.messages?.map((m: any) => this.mapMessageToDomain(m)),
        );
    }

    private mapParticipantToDomain(record: any): Participant {
        return new Participant(
            record.id,
            record.conversationId,
            record.userId,
            record.lastReadAt,
            record.createdAt,
        );
    }

    private mapMessageToDomain(record: any): Message {
        return new Message(
            record.id,
            record.conversationId,
            record.senderId,
            record.content,
            record.type as MessageType,
            record.createdAt,
        );
    }
}
