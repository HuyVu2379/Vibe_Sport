// ===========================================
// APPLICATION LAYER - Validate User Use Case
// Used by JWT strategy to validate authenticated users
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../ports';

export interface ValidateUserInput {
    userId: string;
}

export interface ValidateUserOutput {
    userId: string;
    email: string;
    role: string;
}

@Injectable()
export class ValidateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: ValidateUserInput): Promise<ValidateUserOutput | null> {
        const user = await this.userRepository.findById(input.userId);
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
