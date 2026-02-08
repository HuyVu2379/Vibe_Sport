// ===========================================
// APPLICATION LAYER - Send Message Use Case
// ===========================================

import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../ports/conversation.repository.port';
import { Message } from '../../../domain/entities/conversation.entity';

export interface SendMessageInput {
    userId: string;
    conversationId: string;
    content: string;
}

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository,
    ) { }

    async execute(input: SendMessageInput): Promise<Message> {
        const { userId, conversationId, content } = input;

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
}
