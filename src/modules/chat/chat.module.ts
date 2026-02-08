// ===========================================
// MODULES - Chat Module
// Wires dependencies via DI
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

import { ChatController } from '../../interfaces/http/chat/chat.controller';
import { ChatGateway } from './chat.gateway';

// Ports
import { CONVERSATION_REPOSITORY } from '../../application/ports/conversation.repository.port';
import { BOOKING_REPOSITORY } from '../../application/ports/booking.repository.port';
import { VENUE_REPOSITORY } from '../../application/ports/venue.repository.port';

// Infrastructure implementations
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { BookingRepository } from '../../infrastructure/repositories/booking.repository';
import { VenueRepository } from '../../infrastructure/repositories/venue.repository';

// Use cases
import {
    GetUserConversationsUseCase,
    GetConversationMessagesUseCase,
    SendMessageUseCase,
    StartBookingChatUseCase,
    StartVenueInquiryUseCase,
    GetConversationUseCase,
} from '../../application/use-cases/chat';

@Module({
    imports: [PrismaModule],
    controllers: [ChatController],
    providers: [
        // WebSocket Gateway
        ChatGateway,

        // Use Cases
        GetUserConversationsUseCase,
        GetConversationMessagesUseCase,
        SendMessageUseCase,
        StartBookingChatUseCase,
        StartVenueInquiryUseCase,
        GetConversationUseCase,

        // Repository implementations
        { provide: CONVERSATION_REPOSITORY, useClass: ConversationRepository },
        { provide: BOOKING_REPOSITORY, useClass: BookingRepository },
        { provide: VENUE_REPOSITORY, useClass: VenueRepository },
    ],
    exports: [
        SendMessageUseCase,
        GetConversationUseCase,
    ],
})
export class ChatModule { }
