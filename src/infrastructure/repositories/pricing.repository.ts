// ===========================================
// INFRASTRUCTURE LAYER - Pricing Repository
// Prisma implementation
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    IPricingRepository,
    PricingRule,
    OperatingHours,
} from '../../application/ports/pricing.repository.port';

@Injectable()
export class PricingRepository implements IPricingRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findPricingRulesByCourtId(courtId: string): Promise<PricingRule[]> {
        const rules = await this.prisma.pricingRule.findMany({
            where: { courtId },
        });

        return rules.map((r) => ({
            id: r.id,
            courtId: r.courtId,
            dayType: r.dayType as 'WEEKDAY' | 'WEEKEND',
            startTime: r.startTime,
            endTime: r.endTime,
            pricePerHour: Number(r.pricePerHour),
            isPeak: r.isPeak,
        }));
    }

    async findOperatingHoursByCourtId(courtId: string): Promise<OperatingHours[]> {
        const hours = await this.prisma.operatingHours.findMany({
            where: { courtId },
        });

        return hours.map((h) => ({
            id: h.id,
            courtId: h.courtId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
        }));
    }

    async calculatePrice(
        courtId: string,
        startTime: Date,
        endTime: Date,
    ): Promise<number> {
        const rules = await this.findPricingRulesByCourtId(courtId);

        if (rules.length === 0) {
            // Default price if no rules defined
            const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            return 100000 * hours; // Default 100,000 VND per hour
        }

        const dayOfWeek = startTime.getUTCDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

        const startTimeStr = startTime.toISOString().substring(11, 16);
        const endTimeStr = endTime.toISOString().substring(11, 16);

        // Find applicable pricing rule
        const applicableRule = rules.find(
            (r) =>
                r.dayType === dayType &&
                r.startTime <= startTimeStr &&
                r.endTime >= endTimeStr,
        );

        if (applicableRule) {
            const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            return applicableRule.pricePerHour * hours;
        }

        // Fallback to first rule
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return (rules[0]?.pricePerHour || 100000) * hours;
    }
}
