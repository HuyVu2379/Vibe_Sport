// ===========================================
// APPLICATION LAYER - User Repository Port
// ===========================================

import { User, UserRole } from '../../domain/entities/user.entity';

export interface CreateUserData {
    email: string;
    phone?: string;
    password: string;
    fullName: string;
    role: UserRole;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
    create(data: CreateUserData): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findByEmailOrPhone(emailOrPhone: string): Promise<User | null>;
}
