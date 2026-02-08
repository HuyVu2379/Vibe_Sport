// ===========================================
// INTERFACES LAYER - Chat DTOs
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
    @ApiProperty({ example: 'Hello, I have a question about my booking' })
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class ConversationResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ enum: ['BOOKING', 'VENUE_INQUIRY'] })
    type: string;

    @ApiProperty({ example: 'uuid', required: false })
    bookingId?: string;

    @ApiProperty({ example: 'uuid', required: false })
    venueId?: string;

    @ApiProperty({ example: 'Last message preview...', required: false })
    lastMessage?: string;

    @ApiProperty({ required: false })
    lastMessageAt?: Date;

    @ApiProperty()
    createdAt: Date;
}

export class MessageResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    conversationId: string;

    @ApiProperty({ example: 'uuid' })
    senderId: string;

    @ApiProperty({ example: 'Hello!' })
    content: string;

    @ApiProperty({ enum: ['TEXT', 'IMAGE', 'SYSTEM'] })
    type: string;

    @ApiProperty()
    createdAt: Date;
}

export class ConversationsListResponseDto {
    @ApiProperty({ type: [ConversationResponseDto] })
    items: ConversationResponseDto[];

    @ApiProperty({ example: 10 })
    total: number;
}

export class MessagesListResponseDto {
    @ApiProperty({ type: [MessageResponseDto] })
    items: MessageResponseDto[];

    @ApiProperty({ example: 50 })
    total: number;
}
