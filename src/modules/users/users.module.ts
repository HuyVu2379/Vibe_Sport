// ===========================================
// MODULES - Users Module
// ===========================================

import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../application/ports';
import { UserRepository } from '../../infrastructure/repositories';

@Module({
    providers: [
        { provide: USER_REPOSITORY, useClass: UserRepository },
    ],
    exports: [USER_REPOSITORY],
})
export class UsersModule { }
