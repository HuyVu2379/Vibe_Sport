// ===========================================
// APPLICATION LAYER - Get User Conversations Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../ports/conversation.repository.port';
import { Conversation } from '../../../domain/entities/conversation.entity';

export interface GetUserConversationsInput {
    userId: string;
    page?: number;
    size?: number;
}

export interface GetUserConversationsOutput {
    items: Conversation[];
    total: number;
}

@Injectable()
export class GetUserConversationsUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository,
    ) { }

    async execute(input: GetUserConversationsInput): Promise<GetUserConversationsOutput> {
        const { userId, page = 0, size = 20 } = input;
        return this.conversationRepository.findByUserIdWithDetails(userId, page, size);
    }
}
