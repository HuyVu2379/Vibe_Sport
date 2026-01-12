// ===========================================
// MODULES - Pricing Module
// ===========================================

import { Module } from '@nestjs/common';
import { PRICING_REPOSITORY } from '../../application/ports';
import { PricingRepository } from '../../infrastructure/repositories';

@Module({
    providers: [
        { provide: PRICING_REPOSITORY, useClass: PricingRepository },
    ],
    exports: [PRICING_REPOSITORY],
})
export class PricingModule { }
