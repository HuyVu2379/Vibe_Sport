// ===========================================
// INFRASTRUCTURE LAYER - JWT Token Service
// Implements ITokenService using NestJS JwtService
// ===========================================

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    ITokenService,
    TokenPayload,
    DecodedToken,
} from '../../application/ports/services/token.service.port';

@Injectable()
export class JwtTokenService implements ITokenService {
    constructor(private readonly jwtService: JwtService) { }

    sign(payload: TokenPayload): string {
        return this.jwtService.sign(payload);
    }

    decode(token: string): DecodedToken | null {
        try {
            const decoded = this.jwtService.decode(token) as DecodedToken;
            return decoded;
        } catch {
            return null;
        }
    }

    verify(token: string): DecodedToken | null {
        try {
            return this.jwtService.verify(token) as DecodedToken;
        } catch {
            return null;
        }
    }
}
