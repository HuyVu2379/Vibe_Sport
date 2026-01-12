// ===========================================
// INFRASTRUCTURE LAYER - Court Repository
// Prisma implementation
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ICourtRepository } from '../../application/ports/court.repository.port';
import { Court, SportType, CourtStatus } from '../../domain/entities/court.entity';

@Injectable()
export class CourtRepository implements ICourtRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Court | null> {
        const court = await this.prisma.court.findUnique({
            where: { id },
        });

        return court ? this.mapToDomain(court) : null;
    }

    async findByVenueId(venueId: string): Promise<Court[]> {
        const courts = await this.prisma.court.findMany({
            where: { venueId, status: 'ACTIVE' },
        });

        return courts.map(this.mapToDomain);
    }

    async findByOwnerId(ownerId: string): Promise<Court[]> {
        const courts = await this.prisma.court.findMany({
            where: {
                venue: { ownerId },
                status: 'ACTIVE',
            },
            include: {
                venue: true,
            },
        });

        return courts.map(this.mapToDomain);
    }

    private mapToDomain(record: any): Court {
        return new Court({
            id: record.id,
            venueId: record.venueId,
            name: record.name,
            sportType: record.sportType as SportType,
            status: record.status as CourtStatus,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
}
