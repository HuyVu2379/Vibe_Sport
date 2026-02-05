// ===========================================
// INFRASTRUCTURE - Operating Hours Repository
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DayOfWeek } from '@prisma/client';

export interface OperatingHoursDto {
    id: string;
    venueId: string;
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface SetOperatingHoursDto {
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
}

@Injectable()
export class OperatingHoursRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByVenueId(venueId: string): Promise<OperatingHoursDto[]> {
        return this.prisma.operatingHours.findMany({
            where: { venueId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }

    async setForVenue(venueId: string, hours: SetOperatingHoursDto[]): Promise<void> {
        // Delete existing
        await this.prisma.operatingHours.deleteMany({ where: { venueId } });

        // Create new
        await this.prisma.operatingHours.createMany({
            data: hours.map((h) => ({
                venueId,
                dayOfWeek: h.dayOfWeek,
                openTime: h.openTime,
                closeTime: h.closeTime,
                isClosed: h.isClosed || false,
            })),
        });
    }

    async update(id: string, data: Partial<SetOperatingHoursDto>): Promise<OperatingHoursDto> {
        return this.prisma.operatingHours.update({
            where: { id },
            data,
        });
    }

    async getVenueScheduleForDay(venueId: string, dayOfWeek: DayOfWeek): Promise<OperatingHoursDto | null> {
        return this.prisma.operatingHours.findUnique({
            where: {
                venueId_dayOfWeek: { venueId, dayOfWeek },
            },
        });
    }

    async isVenueOpenOnDay(venueId: string, dayOfWeek: DayOfWeek): Promise<boolean> {
        const hours = await this.getVenueScheduleForDay(venueId, dayOfWeek);
        return hours !== null && !hours.isClosed;
    }
}
