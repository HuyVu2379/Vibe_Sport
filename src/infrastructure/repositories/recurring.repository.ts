import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    IRecurringRepository,
    CreateRecurringPlanData,
} from '../../application/ports/recurring.repository.port';
import { RecurringPlan, RecurringFrequency } from '../../domain/entities/recurring-plan.entity';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class RecurringRepository implements IRecurringRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createPlan(data: CreateRecurringPlanData): Promise<RecurringPlan> {
        const record = await this.prisma.recurringPlan.create({
            data: {
                courtId: data.courtId,
                userId: data.userId,
                startTime: data.startTime,
                endTime: data.endTime,
                dayOfWeek: data.dayOfWeek as DayOfWeek,
                startDate: data.startDate,
                endDate: data.endDate,
                frequency: 'WEEKLY',
            },
        });

        return this.mapToDomain(record);
    }

    async findById(id: string): Promise<RecurringPlan | null> {
        const record = await this.prisma.recurringPlan.findUnique({
            where: { id },
        });

        return record ? this.mapToDomain(record) : null;
    }

    async findByCourtId(courtId: string): Promise<RecurringPlan[]> {
        const records = await this.prisma.recurringPlan.findMany({
            where: { courtId },
        });

        return records.map(this.mapToDomain);
    }

    private mapToDomain(record: any): RecurringPlan {
        return new RecurringPlan(
            record.id,
            record.courtId,
            record.userId,
            record.startTime,
            record.endTime,
            record.dayOfWeek,
            record.startDate,
            record.endDate,
            record.frequency as RecurringFrequency,
            record.createdAt,
            record.updatedAt,
        );
    }
}
