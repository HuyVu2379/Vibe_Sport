// ===========================================
// CHAT MODULE
// ===========================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [PrismaModule],
    controllers: [ChatController],
    providers: [ChatService, ConversationRepository, ChatGateway],
    exports: [ChatService, ConversationRepository],
})
export class ChatModule { }
