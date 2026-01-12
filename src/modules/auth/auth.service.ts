// ===========================================
// MODULES - Auth Service
// ===========================================

import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IUserRepository, USER_REPOSITORY } from '../../application/ports';
import { InvalidCredentialsError, UserInactiveError } from '../../domain/errors';

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
}
