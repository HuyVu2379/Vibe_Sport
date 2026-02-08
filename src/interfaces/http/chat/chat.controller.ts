// ===========================================
// INTERFACES LAYER - Chat Controller
// ===========================================

import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

import {
    SendMessageDto,
    ConversationResponseDto,
    MessageResponseDto,
    ConversationsListResponseDto,
    MessagesListResponseDto,
} from './chat.dto';
import { GetUserConversationsUseCase } from '../../../application/use-cases/chat/get-user-conversations.use-case';
import { GetConversationMessagesUseCase } from '../../../application/use-cases/chat/get-conversation-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/chat/send-message.use-case';
import { StartBookingChatUseCase } from '../../../application/use-cases/chat/start-booking-chat.use-case';
import { StartVenueInquiryUseCase } from '../../../application/use-cases/chat/start-venue-inquiry.use-case';
import { GetConversationUseCase } from '../../../application/use-cases/chat/get-conversation.use-case';

@ApiTags('Chat')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(
        private readonly getUserConversationsUseCase: GetUserConversationsUseCase,
        private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly startBookingChatUseCase: StartBookingChatUseCase,
        private readonly startVenueInquiryUseCase: StartVenueInquiryUseCase,
        private readonly getConversationUseCase: GetConversationUseCase,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get user conversations' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    @ApiResponse({ status: 200, type: ConversationsListResponseDto })
    async getConversations(
        @CurrentUser('userId') userId: string,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    ) {
        return this.getUserConversationsUseCase.execute({ userId, page, size });
    }

    @Get(':conversationId')
    @ApiOperation({ summary: 'Get conversation details' })
    @ApiResponse({ status: 200, type: ConversationResponseDto })
    async getConversation(
        @CurrentUser('userId') userId: string,
        @Param('conversationId') conversationId: string,
    ) {
        return this.getConversationUseCase.execute({ userId, conversationId });
    }

    @Get(':conversationId/messages')
    @ApiOperation({ summary: 'Get conversation messages' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    @ApiResponse({ status: 200, type: MessagesListResponseDto })
    async getMessages(
        @CurrentUser('userId') userId: string,
        @Param('conversationId') conversationId: string,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(50), ParseIntPipe) size: number,
    ) {
        return this.getConversationMessagesUseCase.execute({
            userId,
            conversationId,
            page,
            size,
        });
    }

    @Post(':conversationId/messages')
    @ApiOperation({ summary: 'Send a message' })
    @ApiResponse({ status: 201, type: MessageResponseDto })
    async sendMessage(
        @CurrentUser('userId') userId: string,
        @Param('conversationId') conversationId: string,
        @Body() dto: SendMessageDto,
    ) {
        return this.sendMessageUseCase.execute({
            userId,
            conversationId,
            content: dto.content
        });
    }

    @Post('booking/:bookingId')
    @ApiOperation({ summary: 'Start or get booking chat' })
    @ApiResponse({ status: 201, type: ConversationResponseDto })
    async startBookingChat(
        @CurrentUser('userId') userId: string,
        @Param('bookingId') bookingId: string,
    ) {
        return this.startBookingChatUseCase.execute({ userId, bookingId });
    }

    @Post('venue/:venueId/inquiry')
    @ApiOperation({ summary: 'Start venue inquiry chat' })
    @ApiResponse({ status: 201, type: ConversationResponseDto })
    async startVenueInquiry(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        return this.startVenueInquiryUseCase.execute({ customerId: userId, venueId });
    }
}
