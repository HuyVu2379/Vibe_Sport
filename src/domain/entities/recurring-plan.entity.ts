export enum RecurringFrequency {
    WEEKLY = 'WEEKLY',
}

export class RecurringPlan {
    constructor(
        public readonly id: string,
        public readonly courtId: string,
        public readonly userId: string,
        public readonly startTime: string, // Format: "HH:mm"
        public readonly endTime: string,   // Format: "HH:mm"
        public readonly dayOfWeek: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly frequency: RecurringFrequency,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}
