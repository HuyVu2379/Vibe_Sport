// ===========================================
// APPLICATION LAYER - Password Service Port
// Interface for password hashing operations
// ===========================================

/**
 * Port for password hashing and validation
 * Abstracts bcrypt implementation details from application layer
 */
export interface IPasswordService {
    /**
     * Hash a plain text password
     * @param password - Plain text password
     * @returns Hashed password
     */
    hash(password: string): Promise<string>;

    /**
     * Compare plain text password with hashed password
     * @param password - Plain text password
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match
     */
    compare(password: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');
