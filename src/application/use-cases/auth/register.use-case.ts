// ===========================================
// APPLICATION LAYER - Register Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../ports';
import { ITokenService, TOKEN_SERVICE } from '../../ports/services/token.service.port';
import { IPasswordService, PASSWORD_SERVICE } from '../../ports/services/password.service.port';
import { EmailConflictError, PhoneConflictError } from '../../../domain/errors';
import { UserRole } from '../../../domain/entities';

export interface RegisterInput {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone: string;
}

export interface RegisterOutput {
    token: string;
    user: {
        userId: string;
        role: string;
    };
}

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenService,
        @Inject(PASSWORD_SERVICE)
        private readonly passwordService: IPasswordService,
    ) { }

    async execute(params: RegisterInput): Promise<RegisterOutput> {
        const [emailUser, phoneUser] = await Promise.all([
            this.userRepository.findByEmail(params.email),
            this.userRepository.findByPhone(params.phone),
        ]);

        if (emailUser) {
            throw new EmailConflictError(params.email);
        }
        if (phoneUser) {
            throw new PhoneConflictError(params.phone);
        }

        const pwdHash = await this.passwordService.hash(params.password);

        const result = await this.userRepository.create({
            email: params.email,
            password: pwdHash,
            fullName: params.fullName,
            role: params.role as UserRole,
            phone: params.phone,
        });

        return {
            token: this.tokenService.sign({
                sub: result.id,
                email: result.email,
                role: result.role,
            }),
            user: {
                userId: result.id,
                role: result.role,
            },
        };
    }
}
