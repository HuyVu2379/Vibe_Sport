import { RecurringPlan } from '../../domain/entities/recurring-plan.entity';

export const RECURRING_REPOSITORY = Symbol('RECURRING_REPOSITORY');

export interface CreateRecurringPlanData {
    courtId: string;
    userId: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    startDate: Date;
    endDate: Date;
}

export interface IRecurringRepository {
    createPlan(data: CreateRecurringPlanData): Promise<RecurringPlan>;
    findById(id: string): Promise<RecurringPlan | null>;
    findByCourtId(courtId: string): Promise<RecurringPlan[]>;
}
