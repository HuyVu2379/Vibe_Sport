// ===========================================
// DOMAIN LAYER - Time Range Value Object
// ===========================================

export class TimeRange {
    constructor(
        public readonly startTime: Date,
        public readonly endTime: Date,
    ) {
        if (startTime >= endTime) {
            throw new Error('Start time must be before end time');
        }
    }

    overlaps(other: TimeRange): boolean {
        return this.startTime < other.endTime && this.endTime > other.startTime;
    }

    getDurationMinutes(): number {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
    }

    getDurationHours(): number {
        return this.getDurationMinutes() / 60;
    }
}
