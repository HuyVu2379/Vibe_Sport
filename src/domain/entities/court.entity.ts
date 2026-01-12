// ===========================================
// DOMAIN LAYER - Court Entity
// ===========================================

export enum SportType {
    FOOTBALL = 'FOOTBALL',
    BADMINTON = 'BADMINTON',
    TENNIS = 'TENNIS',
    BASKETBALL = 'BASKETBALL',
    VOLLEYBALL = 'VOLLEYBALL',
}

export enum CourtStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface CourtProps {
    id: string;
    venueId: string;
    name: string;
    sportType: SportType;
    status: CourtStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Court {
    private readonly props: CourtProps;

    constructor(props: CourtProps) {
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }

    get venueId(): string {
        return this.props.venueId;
    }

    get name(): string {
        return this.props.name;
    }

    get sportType(): SportType {
        return this.props.sportType;
    }

    get status(): CourtStatus {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    isActive(): boolean {
        return this.status === CourtStatus.ACTIVE;
    }

    toProps(): CourtProps {
        return { ...this.props };
    }
}
