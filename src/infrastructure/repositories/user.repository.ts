// ===========================================
// INFRASTRUCTURE LAYER - User Repository
// Prisma implementation
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    IUserRepository,
    CreateUserData,
} from '../../application/ports/user.repository.port';
import { User, UserRole, UserStatus } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateUserData): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                phone: data.phone,
                password: data.password,
                fullName: data.fullName,
                role: data.role,
            },
        });

        return this.mapToDomain(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        return user ? this.mapToDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? this.mapToDomain(user) : null;
    }

    async findByPhone(phone: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: { phone },
        });

        return user ? this.mapToDomain(user) : null;
    }

    async findByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrPhone },
                    { phone: emailOrPhone },
                ],
            },
        });

        return user ? this.mapToDomain(user) : null;
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    async updateProfile(
        userId: string,
        data: { fullName?: string; phoneNumber?: string; avatarUrl?: string },
    ): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.fullName !== undefined && { fullName: data.fullName }),
                ...(data.phoneNumber !== undefined && { phone: data.phoneNumber }),
                ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
            },
        });
    }

    private mapToDomain(record: any): User {
        return new User({
            id: record.id,
            email: record.email,
            phone: record.phone,
            password: record.password,
            fullName: record.fullName,
            avatarUrl: record.avatarUrl || '',
            role: record.role as UserRole,
            status: record.status as UserStatus,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
}
