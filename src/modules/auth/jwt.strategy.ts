// ===========================================
// MODULES - JWT Strategy
// ===========================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ValidateUserUseCase } from '../../application/use-cases/auth/validate-user.use-case';
import { CheckTokenRevokedUseCase } from '../../application/use-cases/auth/check-token-revoked.use-case';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly validateUserUseCase: ValidateUserUseCase,
        private readonly checkTokenRevokedUseCase: CheckTokenRevokedUseCase,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.secret'),
            passReqToCallback: true, // Pass request to validate method
        });
    }

    async validate(req: any, payload: any) {
        // Extract token from request
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        // Check if token has been revoked
        if (token) {
            const isRevoked = await this.checkTokenRevokedUseCase.execute({ token });
            if (isRevoked) {
                throw new UnauthorizedException('Token has been revoked');
            }
        }

        // Validate user
        const user = await this.validateUserUseCase.execute({ userId: payload.sub });
        if (!user) {
            throw new UnauthorizedException('User not found or inactive');
        }
        return user;
    }
}
