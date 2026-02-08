// ===========================================
// APPLICATION LAYER - Token Service Port
// Interface for JWT operations
// ===========================================

/**
 * Payload for JWT token generation
 */
export interface TokenPayload {
    sub: string;
    email: string;
    role: string;
}

/**
 * Decoded JWT token structure
 */
export interface DecodedToken {
    sub: string;
    email: string;
    role: string;
    exp: number;
    iat: number;
}

/**
 * Port for token generation and validation
 * Abstracts JWT implementation details from application layer
 */
export interface ITokenService {
    /**
     * Sign a payload and return JWT token string
     */
    sign(payload: TokenPayload): string;

    /**
     * Decode a token without verification
     */
    decode(token: string): DecodedToken | null;

    /**
     * Verify and decode a token
     */
    verify(token: string): DecodedToken | null;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
