// ===========================================
// APPLICATION LAYER - Get Conversation Use Case
// ===========================================

import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../ports/conversation.repository.port';
import { Conversation } from '../../../domain/entities/conversation.entity';

export interface GetConversationInput {
    userId: string;
    conversationId: string;
}

@Injectable()
export class GetConversationUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository,
    ) { }

    async execute(input: GetConversationInput): Promise<Conversation> {
        const { userId, conversationId } = input;

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
