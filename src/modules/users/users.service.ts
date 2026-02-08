// ===========================================
// MODULES LAYER - Users Service
// ===========================================

import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../application/ports';
import { UserNotFoundError } from '../../domain/errors';

/**
 * UsersService handles user profile operations
 * 
 * Responsibilities:
 * - Update user profile information (fullName, avatarUrl)
 */
@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    /**
     * Update user profile
     * 
     * Flow:
     * 1. Validate that at least one field is provided
     * 2. Fetch user by userId to ensure they exist
     * 3. Update the provided fields in database
     * 
     * @param userId - Authenticated user ID
     * @param data - Profile data to update (fullName and/or avatarUrl)
     * @throws UserNotFoundError if user doesn't exist
     * @throws BadRequestException if no fields provided
     */
    async updateProfile(
        userId: string,
        data: { fullName?: string; avatarUrl?: string },
    ): Promise<void> {
        this.logger.log(`Update profile request for user: ${userId}`);

        // Validate that at least one field is provided
        if (!data.fullName && !data.avatarUrl) {
            throw new BadRequestException('At least one field (fullName or avatarUrl) must be provided');
        }

        // Fetch user to ensure they exist
        const user = await this.userRepository.findById(userId);
        if (!user) {
            this.logger.warn(`User not found: ${userId}`);
            throw new UserNotFoundError(userId);
        }

        // Update profile in database
        await this.userRepository.updateProfile(userId, data);

        this.logger.log(`Profile updated successfully for user: ${userId}`);
    }
}
