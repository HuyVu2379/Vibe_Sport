import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ISocketService } from '../../application/ports/socket.service.port';

@Injectable()
export class SocketService implements ISocketService {
    public server: Server;

    emitToUser(userId: string, event: string, data: any) {
        if (this.server) {
            this.server.to(`user_${userId}`).emit(event, data);
        }
    }

    emitToVenue(venueId: string, event: string, data: any) {
        if (this.server) {
            this.server.to(`venue_${venueId}`).emit(event, data);
        }
    }

    emitToPublic(event: string, data: any) {
        if (this.server) {
            this.server.emit(event, data);
        }
    }
}
