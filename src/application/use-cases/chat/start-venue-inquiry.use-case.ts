// ===========================================
// APPLICATION LAYER - Start Venue Inquiry Use Case
// ===========================================

import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../ports/conversation.repository.port';
import { IVenueRepository, VENUE_REPOSITORY } from '../../ports/venue.repository.port';
import { Conversation } from '../../../domain/entities/conversation.entity';

export interface StartVenueInquiryInput {
    customerId: string;
    venueId: string;
}

@Injectable()
export class StartVenueInquiryUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository,
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async execute(input: StartVenueInquiryInput): Promise<Conversation> {
        const { customerId, venueId } = input;

        // Get venue owner
        const venue = await this.venueRepository.findById(venueId);

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
}
