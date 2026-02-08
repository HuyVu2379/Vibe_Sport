// ===========================================
// INFRASTRUCTURE LAYER - Bcrypt Password Service
// Implements IPasswordService using bcrypt
// ===========================================

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordService } from '../../application/ports/services/password.service.port';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordService implements IPasswordService {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
