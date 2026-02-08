// ===========================================
// APPLICATION LAYER - Update Profile Use Case
// ===========================================

import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../ports';
import { UserNotFoundError } from '../../../domain/errors';

export interface UpdateProfileInput {
    userId: string;
    fullName?: string;
    avatarUrl?: string;
}

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(input: UpdateProfileInput): Promise<void> {
        const { userId, fullName, avatarUrl } = input;

        // Validate that at least one field is provided
        if (!fullName && !avatarUrl) {
            throw new BadRequestException('At least one field (fullName or avatarUrl) must be provided');
        }

        // Fetch user to ensure they exist
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // Update profile in database
        await this.userRepository.updateProfile(userId, { fullName, avatarUrl });
    }
}
