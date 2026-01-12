// ===========================================
// DOMAIN LAYER - User Entity
// ===========================================

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface UserProps {
    id: string;
    email: string;
    phone?: string;
    password: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    private readonly props: UserProps;

    constructor(props: UserProps) {
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }

    get email(): string {
        return this.props.email;
    }

    get phone(): string | undefined {
        return this.props.phone;
    }

    get password(): string {
        return this.props.password;
    }

    get fullName(): string {
        return this.props.fullName;
    }

    get role(): UserRole {
        return this.props.role;
    }

    get status(): UserStatus {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    isActive(): boolean {
        return this.status === UserStatus.ACTIVE;
    }

    isCustomer(): boolean {
        return this.role === UserRole.CUSTOMER;
    }

    isOwner(): boolean {
        return this.role === UserRole.OWNER;
    }

    isAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }

    toProps(): UserProps {
        return { ...this.props };
    }
}
