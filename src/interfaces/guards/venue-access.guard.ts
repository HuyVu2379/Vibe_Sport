import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
    ForbiddenException,
} from '@nestjs/common';
import {
    IVenueRepository,
    VENUE_REPOSITORY,
} from '../../application/ports/venue.repository.port';
import {
    IVenueStaffRepository,
    VENUE_STAFF_REPOSITORY,
} from '../../application/ports/venue-staff.repository.port';
import { UserRole } from '../../domain/entities/user.entity';

@Injectable()
export class VenueAccessGuard implements CanActivate {
    constructor(
        @Inject(VENUE_REPOSITORY)
        private readonly venueRepository: IVenueRepository,
        @Inject(VENUE_STAFF_REPOSITORY)
        private readonly venueStaffRepository: IVenueStaffRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params, query, body } = request;

        const venueId = params.venueId || query.venueId || body.venueId;

        if (!venueId) {
            return true; // If no venueId, let other guards handle it or assume it's public
        }

        if (user.role === UserRole.ADMIN) {
            return true;
        }

        if (user.role === UserRole.OWNER) {
            const venue = await this.venueRepository.findById(venueId);
            if (venue && venue.ownerId === user.id) {
                return true;
            }
        }

        if (user.role === UserRole.STAFF) {
            const isStaff = await this.venueStaffRepository.isStaffOfVenue(user.id, venueId);
            if (isStaff) {
                return true;
            }
        }

        throw new ForbiddenException('You do not have access to this venue');
    }
}
