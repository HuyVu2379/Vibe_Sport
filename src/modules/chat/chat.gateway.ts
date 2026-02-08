// ===========================================
// CHAT WEBSOCKET GATEWAY
// ===========================================

import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SendMessageUseCase } from '../../application/use-cases/chat/send-message.use-case';
import { GetConversationUseCase } from '../../application/use-cases/chat/get-conversation.use-case';

interface JoinRoomPayload {
    conversationId: string;
    userId: string;
}

interface SendMessagePayload {
    conversationId: string;
    userId: string;
    content: string;
}

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly getConversationUseCase: GetConversationUseCase,
    ) { }

    handleConnection(client: Socket) {
        this.logger.log(`Chat client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Chat client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinRoomPayload,
    ) {
        const { conversationId, userId } = payload;

        try {
            // Verify user is participant
            await this.getConversationUseCase.execute({ userId, conversationId });

            // Join the room
            client.join(`conversation:${conversationId}`);

            this.logger.log(`User ${userId} joined conversation ${conversationId}`);

            return { success: true, conversationId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('leave_conversation')
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { conversationId: string },
    ) {
        client.leave(`conversation:${payload.conversationId}`);
        return { success: true };
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SendMessagePayload,
    ) {
        const { conversationId, userId, content } = payload;

        try {
            const message = await this.sendMessageUseCase.execute({
                userId,
                conversationId,
                content
            });

            // Broadcast to all participants in the conversation
            this.server.to(`conversation:${conversationId}`).emit('new_message', {
                conversationId,
                message,
            });

            return { success: true, message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { conversationId: string; userId: string; isTyping: boolean },
    ) {
        client.to(`conversation:${payload.conversationId}`).emit('user_typing', {
            userId: payload.userId,
            isTyping: payload.isTyping,
        });
    }

    // Utility method to broadcast new message from service
    broadcastNewMessage(conversationId: string, message: any) {
        this.server.to(`conversation:${conversationId}`).emit('new_message', {
            conversationId,
            message,
        });
    }
}
