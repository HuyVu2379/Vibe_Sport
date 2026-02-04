// ===========================================
// CHAT CONTROLLER
// ===========================================

import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../interfaces/guards/jwt-auth.guard';
import { CurrentUser } from '../../interfaces/decorators/current-user.decorator';
import { ChatService } from './chat.service';

class SendMessageDto {
    content: string;
}

@ApiTags('Chat')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    @ApiOperation({ summary: 'Get user conversations' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    async getConversations(
        @CurrentUser('userId') userId: string,
        @Query('page') page = 0,
        @Query('size') size = 20,
    ) {
        return this.chatService.getUserConversations(userId, Number(page), Number(size));
    }

    @Get(':conversationId')
    @ApiOperation({ summary: 'Get conversation details' })
    async getConversation(
        @CurrentUser('userId') userId: string,
        @Param('conversationId') conversationId: string,
    ) {
        return this.chatService.getConversation(userId, conversationId);
    }

    @Get(':conversationId/messages')
    @ApiOperation({ summary: 'Get conversation messages' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'size', required: false, type: Number })
    async getMessages(
        @CurrentUser('userId') userId: string,
        @Param('conversationId') conversationId: string,
        @Query('page') page = 0,
        @Query('size') size = 50,
    ) {
        return this.chatService.getConversationMessages(
            userId,
            conversationId,
            Number(page),
            Number(size),
        );
    }

    @Post(':conversationId/messages')
    @ApiOperation({ summary: 'Send a message' })
    async sendMessage(
        @CurrentUser('userId') userId: string,
        @Param('conversationId') conversationId: string,
        @Body() dto: SendMessageDto,
    ) {
        return this.chatService.sendMessage(userId, conversationId, dto.content);
    }

    @Post('booking/:bookingId')
    @ApiOperation({ summary: 'Start or get booking chat' })
    async startBookingChat(
        @CurrentUser('userId') userId: string,
        @Param('bookingId') bookingId: string,
    ) {
        return this.chatService.startBookingChat(userId, bookingId);
    }

    @Post('venue/:venueId/inquiry')
    @ApiOperation({ summary: 'Start venue inquiry chat' })
    async startVenueInquiry(
        @CurrentUser('userId') userId: string,
        @Param('venueId') venueId: string,
    ) {
        return this.chatService.startVenueInquiry(userId, venueId);
    }
}
