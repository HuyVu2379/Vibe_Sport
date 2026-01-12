// ===========================================
// DOMAIN LAYER - Venue Entity
// ===========================================

export enum VenueStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface VenueProps {
    id: string;
    ownerId: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: VenueStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Venue {
    private readonly props: VenueProps;

    constructor(props: VenueProps) {
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }

    get ownerId(): string {
        return this.props.ownerId;
    }

    get name(): string {
        return this.props.name;
    }

    get address(): string {
        return this.props.address;
    }

    get latitude(): number {
        return this.props.latitude;
    }

    get longitude(): number {
        return this.props.longitude;
    }

    get status(): VenueStatus {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    isActive(): boolean {
        return this.status === VenueStatus.ACTIVE;
    }

    toProps(): VenueProps {
        return { ...this.props };
    }
}
