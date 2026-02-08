// ===========================================
// APPLICATION LAYER - Token Blacklist Service Port
// Interface for token revocation
// ===========================================

/**
 * Port for token blacklist operations
 * Abstracts Redis implementation details from application layer
 */
export interface ITokenBlacklistService {
    /**
     * Add a token to the blacklist
     * @param token - JWT token to blacklist
     * @param ttlSeconds - Time to live in seconds
     */
    add(token: string, ttlSeconds: number): Promise<void>;

    /**
     * Check if a token is blacklisted
     * @param token - JWT token to check
     * @returns True if token is blacklisted
     */
    isBlacklisted(token: string): Promise<boolean>;
}

export const TOKEN_BLACKLIST_SERVICE = Symbol('TOKEN_BLACKLIST_SERVICE');
