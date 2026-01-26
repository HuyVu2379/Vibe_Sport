export const SOCKET_SERVICE = 'SOCKET_SERVICE';

export interface ISocketService {
    emitToUser(userId: string, event: string, data: any): void;
    emitToVenue(venueId: string, event: string, data: any): void;
    emitToPublic(event: string, data: any): void;
}
