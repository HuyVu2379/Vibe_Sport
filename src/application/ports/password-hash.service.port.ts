// ===========================================
// APPLICATION LAYER - Password Service Port
// ===========================================

export interface IPasswordHashService {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}

export const PASSWORD_HASH_SERVICE = Symbol('PASSWORD_HASH_SERVICE');
