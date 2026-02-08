// ===========================================
// INFRASTRUCTURE - Bcrypt Password Hash Service
// ===========================================

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IPasswordHashService } from '../../application/ports/password-hash.service.port';

@Injectable()
export class BcryptPasswordHashService implements IPasswordHashService {
    private readonly saltRounds: number;

    constructor(private readonly configService: ConfigService) {
        this.saltRounds = this.configService.get<number>('password.saltRounds', 10);
    }

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
