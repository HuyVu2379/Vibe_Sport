// ===========================================
// APPLICATION LAYER - Start Booking Chat Use Case
// ===========================================

import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../ports/conversation.repository.port';
import { IBookingRepository, BOOKING_REPOSITORY } from '../../ports/booking.repository.port';
import { IVenueRepository, VENUE_REPOSITORY } from '../../ports/venue.repository.port';
import { Conversation } from '../../../domain/entities/conversation.entity';

export interface StartBookingChatInput {
    userId: string;
    bookingId: string;
}

@Injectable()
export class StartBookingChatUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository,
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
    ) { }

    async execute(input: StartBookingChatInput): Promise<Conversation> {
        const { userId, bookingId } = input;

        // Get booking with venue info
        const booking = await this.bookingRepository.findByIdWithVenue(bookingId);

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // Get venue to find owner
        const venue = await this.venueRepository.findById(booking.venueId);
        if (!venue) {
            throw new NotFoundException('Venue not found');
        }

        const isCustomer = booking.userId === userId;
        const isOwner = venue.ownerId === userId;

        if (!isCustomer && !isOwner) {
            throw new ForbiddenException('You are not related to this booking');
        }

        return this.conversationRepository.findOrCreateBookingChat(bookingId, [
            booking.userId,
            venue.ownerId,
        ]);
    }
}
