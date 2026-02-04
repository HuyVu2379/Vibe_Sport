// ===========================================
// CHAT SERVICE
// ===========================================

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConversationRepository, CreateMessageDto } from '../../infrastructure/repositories/conversation.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Conversation, ConversationType, Message } from '../../domain/entities/conversation.entity';

@Injectable()
export class ChatService {
    constructor(
        private readonly conversationRepository: ConversationRepository,
        private readonly prisma: PrismaService,
    ) { }

    async getUserConversations(userId: string, page = 0, size = 20) {
        return this.conversationRepository.findByUserIdWithDetails(userId, page, size);
    }

    async getConversationMessages(
        userId: string,
        conversationId: string,
        page = 0,
        size = 50,
    ): Promise<{ items: Message[]; total: number }> {
        // Verify user is participant
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant of this conversation');
        }

        // Mark as read
        await this.conversationRepository.markAsRead(conversationId, userId);

        return this.conversationRepository.findMessages(conversationId, page, size);
    }

    async sendMessage(
        userId: string,
        conversationId: string,
        content: string,
    ): Promise<Message> {
        // Verify user is participant
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant of this conversation');
        }

        return this.conversationRepository.createMessage({
            conversationId,
            senderId: userId,
            content,
        });
    }

    async startBookingChat(
        userId: string,
        bookingId: string,
    ): Promise<Conversation> {
        // Get booking and verify user is owner or customer
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                court: {
                    include: { venue: true },
                },
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        const isCustomer = booking.userId === userId;
        const isOwner = booking.court.venue.ownerId === userId;

        if (!isCustomer && !isOwner) {
            throw new ForbiddenException('You are not related to this booking');
        }

        return this.conversationRepository.findOrCreateBookingChat(bookingId, [
            booking.userId,
            booking.court.venue.ownerId,
        ]);
    }

    async startVenueInquiry(
        customerId: string,
        venueId: string,
    ): Promise<Conversation> {
        // Get venue owner
        const venue = await this.prisma.venue.findUnique({
            where: { id: venueId },
        });

        if (!venue) {
            throw new NotFoundException('Venue not found');
        }

        if (venue.ownerId === customerId) {
            throw new ForbiddenException('You cannot start inquiry on your own venue');
        }

        return this.conversationRepository.findOrCreateVenueInquiry(
            venueId,
            customerId,
            venue.ownerId,
        );
    }

    async getConversation(userId: string, conversationId: string): Promise<Conversation> {
        const conversation = await this.conversationRepository.findById(conversationId);

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant of this conversation');
        }

        return conversation;
    }
}
