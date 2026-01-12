// ===========================================
// MODULES - Courts Module
// ===========================================

import { Module } from '@nestjs/common';
import { COURT_REPOSITORY } from '../../application/ports';
import { CourtRepository } from '../../infrastructure/repositories';

@Module({
    providers: [
        { provide: COURT_REPOSITORY, useClass: CourtRepository },
    ],
    exports: [COURT_REPOSITORY],
})
export class CourtsModule { }
