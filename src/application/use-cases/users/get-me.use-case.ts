import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { UserNotFoundError } from '../../../domain/errors';
import { IUserRepository, TOKEN_SERVICE, USER_REPOSITORY } from '../../ports';
import { ITokenService } from '../../ports';

@Injectable()
export class GetMeUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    ) { }

    async execute(input: { userId: string; token: string }): Promise<any> {
        const { userId, token } = input;

        // Verify token
        const decoded = this.tokenService.verify(token);
        if (!decoded || decoded.sub !== userId) {
            throw new BadRequestException('Invalid token');
        }

        // Get user
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        return {
            userId: user.id,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        };
    }
}