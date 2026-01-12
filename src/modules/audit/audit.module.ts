// ===========================================
// MODULES - Audit Module
// ===========================================

import { Module } from '@nestjs/common';
import { AUDIT_REPOSITORY } from '../../application/ports';
import { AuditRepository } from '../../infrastructure/repositories';

@Module({
    providers: [
        { provide: AUDIT_REPOSITORY, useClass: AuditRepository },
    ],
    exports: [AUDIT_REPOSITORY],
})
export class AuditModule { }
