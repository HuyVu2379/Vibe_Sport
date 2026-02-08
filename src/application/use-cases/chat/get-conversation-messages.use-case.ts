// ===========================================
// APPLICATION LAYER - Get Conversation Messages Use Case
// ===========================================

import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../ports/conversation.repository.port';
import { Message } from '../../../domain/entities/conversation.entity';

export interface GetConversationMessagesInput {
    userId: string;
    conversationId: string;
    page?: number;
    size?: number;
}

export interface GetConversationMessagesOutput {
    items: Message[];
    total: number;
}

@Injectable()
export class GetConversationMessagesUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository,
    ) { }

    async execute(input: GetConversationMessagesInput): Promise<GetConversationMessagesOutput> {
        const { userId, conversationId, page = 0, size = 50 } = input;

        // Verify user is participant
        const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant of this conversation');
        }

        // Mark as read
        await this.conversationRepository.markAsRead(conversationId, userId);

        return this.conversationRepository.findMessages(conversationId, page, size);
    }
}
