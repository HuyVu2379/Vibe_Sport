// ===========================================
// MODULES - Auth Service
// ===========================================

import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IUserRepository, USER_REPOSITORY } from '../../application/ports';
import { EmailConflictError, InvalidCredentialsError, PhoneConflictError, UserInactiveError } from '../../domain/errors';
import { RegisterDto, RegisterResponseDto } from '@/interfaces/http/auth/auth.dto';
import { UserRole } from '@/domain/entities';
import { RedisService } from '@/infrastructure/redis/redis.service';

const SALT_OF_ROUND = 10;
export interface LoginInput {
    phoneOrEmail: string;
    password: string;
}

export interface LoginOutput {
    token: string;
    user: {
        userId: string;
        role: string;
    };
}

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    async login(input: LoginInput): Promise<LoginOutput> {
        const { phoneOrEmail, password } = input;

        // Find user by email or phone
        const user = await this.userRepository.findByEmailOrPhone(phoneOrEmail);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        // Check if user is active
        if (!user.isActive()) {
            throw new UserInactiveError();
        }

        // Generate JWT
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const token = this.jwtService.sign(payload);

        return {
            token,
            user: {
                userId: user.id,
                role: user.role,
            },
        };
    }

    async validateUser(userId: string): Promise<any> {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.isActive()) {
            return null;
        }
        return {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
    }

    async register(params: RegisterDto): Promise<RegisterResponseDto> {
        const [emailUser, phoneUser] = await Promise.all([
            this.userRepository.findByEmail(params.email),
            this.userRepository.findByPhone(params.phone),
        ])
        if (emailUser) {
            throw new EmailConflictError(params.email)
        }
        if (phoneUser) {
            throw new PhoneConflictError(params.phone)
        }
        const pwdHash = await bcrypt.hash(params.password, SALT_OF_ROUND)
        const result = await this.userRepository.create({
            email: params.email,
            password: pwdHash,
            fullName: params.fullName,
            role: params.role as UserRole,
            phone: params.phone,
        })
        return {
            token: this.jwtService.sign({
                sub: result.id,
                email: result.email,
                role: result.role,
            }),
            user: {
                userId: result.id,
                role: result.role,
            },
        }
    }

    /**
     * Revoke a JWT token by adding it to Redis blacklist
     * The token will be stored in Redis with TTL matching token expiration
     * @param token - JWT token to revoke
     */
    async revokeToken(token: string): Promise<void> {
        try {
            // Decode token to get expiration time
            const decoded = this.jwtService.decode(token) as any;

            if (!decoded || !decoded.exp) {
                return; // Invalid token, nothing to revoke
            }

            // Calculate TTL: time until token expires
            const now = Math.floor(Date.now() / 1000);
            const ttl = decoded.exp - now;

            // Only blacklist if token hasn't expired yet
            if (ttl > 0) {
                const key = this.buildTokenBlacklistKey(token);
                await this.redisService.set(key, 'revoked', ttl);
            }
        } catch (error) {
            // Log error but don't throw - revocation failure shouldn't break the flow
            console.error('Error revoking token:', error);
        }
    }

    /**
     * Check if a token has been revoked
     * @param token - JWT token to check
     * @returns true if token is blacklisted, false otherwise
     */
    async isTokenRevoked(token: string): Promise<boolean> {
        try {
            const key = this.buildTokenBlacklistKey(token);
            return await this.redisService.exists(key);
        } catch (error) {
            console.error('Error checking token revocation status:', error);
            return false; // On error, assume token is not revoked
        }
    }

    /**
     * Build Redis key for token blacklist
     * Format: token:blacklist:{tokenHash}
     */
    private buildTokenBlacklistKey(token: string): string {
        // Use a hash of the token to avoid storing full token in Redis key
        // For simplicity, we'll use a substring. In production, consider using crypto.createHash
        const tokenHash = Buffer.from(token).toString('base64').substring(0, 32);
        return `token:blacklist:${tokenHash}`;
    }
}
