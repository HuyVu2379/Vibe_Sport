// ===========================================
// INFRASTRUCTURE - Amenity Repository
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface AmenityDto {
    id: string;
    name: string;
    code: string | null;
    icon: string | null;
    description: string | null;
}

@Injectable()
export class AmenityRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<AmenityDto[]> {
        return this.prisma.amenity.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string): Promise<AmenityDto | null> {
        return this.prisma.amenity.findUnique({ where: { id } });
    }

    async findByVenueId(venueId: string): Promise<AmenityDto[]> {
        const venueAmenities = await this.prisma.venueAmenity.findMany({
            where: { venueId },
            include: { amenity: true },
        });

        return venueAmenities.map((va) => va.amenity);
    }

    async addToVenue(venueId: string, amenityIds: string[]): Promise<void> {
        await this.prisma.venueAmenity.createMany({
            data: amenityIds.map((amenityId) => ({ venueId, amenityId })),
            skipDuplicates: true,
        });
    }

    async removeFromVenue(venueId: string, amenityIds: string[]): Promise<void> {
        await this.prisma.venueAmenity.deleteMany({
            where: {
                venueId,
                amenityId: { in: amenityIds },
            },
        });
    }

    async setVenueAmenities(venueId: string, amenityIds: string[]): Promise<void> {
        // Delete all existing
        await this.prisma.venueAmenity.deleteMany({ where: { venueId } });

        // Add new ones
        if (amenityIds.length > 0) {
            await this.prisma.venueAmenity.createMany({
                data: amenityIds.map((amenityId) => ({ venueId, amenityId })),
            });
        }
    }

    async create(data: { name: string; code?: string; icon?: string; description?: string }): Promise<AmenityDto> {
        return this.prisma.amenity.create({ data });
    }
}
