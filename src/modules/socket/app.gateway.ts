import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    OnGatewayInit,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SocketService } from './socket.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    private logger = new Logger('AppGateway');

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly socketService: SocketService,
    ) { }

    afterInit(server: Server) {
        this.socketService.server = server;
        this.logger.log('WebSocket Gateway initialized');
    }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                // For now, if no token, we just don't join user room.
                // Or we can disconnect if we want to enforce auth.
                // Assuming public access is allowed for general events, but let's log it.
                // The plan says "Users connect with a JWT token".
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('jwt.secret'),
            });

            const userId = payload.sub;
            client.join(`user_${userId}`);
            this.logger.log(`Client connected: ${client.id}, User: ${userId}`);

            // Also join any relevant venue rooms if they are owner/staff?
            // This would require checking DB. Optimization: client sends "join_venue" event later.

        } catch (e) {
            // Token invalid or expired
            // this.logger.error(`Connection auth error: ${e.message}`);
            // client.disconnect(); 
            // We usually don't disconnect immediately if we support public access, 
            // but if the token was sent and is invalid, maybe we should.
        }
    }

    handleDisconnect(client: Socket) {
        // this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_venue')
    handleJoinVenue(client: Socket, venueId: string) {
        client.join(`venue_${venueId}`);
        this.logger.log(`Client ${client.id} joined venue_${venueId}`);
    }

    @SubscribeMessage('leave_venue')
    handleLeaveVenue(client: Socket, venueId: string) {
        client.leave(`venue_${venueId}`);
        this.logger.log(`Client ${client.id} left venue_${venueId}`);
    }

    private extractToken(client: Socket): string | undefined {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        if (client.handshake.query.token) {
            return client.handshake.query.token as string;
        }
        return undefined;
    }
}
