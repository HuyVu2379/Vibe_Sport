import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IVenueStaffRepository } from '../../application/ports/venue-staff.repository.port';

@Injectable()
export class VenueStaffRepository implements IVenueStaffRepository {
    constructor(private readonly prisma: PrismaService) { }

    async addStaff(venueId: string, userId: string): Promise<void> {
        await this.prisma.venueStaff.create({
            data: { venueId, userId },
        });
    }

    async removeStaff(venueId: string, userId: string): Promise<void> {
        await this.prisma.venueStaff.delete({
            where: {
                venueId_userId: { venueId, userId },
            },
        });
    }

    async isStaffOfVenue(userId: string, venueId: string): Promise<boolean> {
        const staff = await this.prisma.venueStaff.findUnique({
            where: {
                venueId_userId: { venueId, userId },
            },
        });
        return !!staff;
    }

    async findStaffByVenueId(venueId: string): Promise<string[]> {
        const staffs = await this.prisma.venueStaff.findMany({
            where: { venueId },
            select: { userId: true },
        });
        return staffs.map((s) => s.userId);
    }
}
