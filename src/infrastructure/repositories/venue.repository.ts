// ===========================================
// INFRASTRUCTURE LAYER - Venue Repository
// Prisma implementation
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
    IVenueRepository,
    SearchVenuesParams,
    PaginatedResult,
    VenueWithDistance,
} from '../../application/ports/venue.repository.port';
import { Venue, VenueStatus } from '../../domain/entities/venue.entity';
import { VenuePolicy, RefundRule, DepositType } from '../../domain/entities/venue-policy.entity';

@Injectable()
export class VenueRepository implements IVenueRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Venue | null> {
        const venue = await this.prisma.venue.findUnique({
            where: { id },
        });

        return venue ? this.mapToDomain(venue) : null;
    }

    async findByIdWithCourts(id: string): Promise<any | null> {
        const venue = await this.prisma.venue.findUnique({
            where: { id },
            include: {
                courts: {
                    where: { status: 'ACTIVE' },
                },
            },
        });

        return venue;
    }

    async search(params: SearchVenuesParams): Promise<PaginatedResult<VenueWithDistance>> {
        const { lat, lng, radiusKm, sportType, q, page = 0, size = 10 } = params;

        // Build where clause
        const where: any = {
            status: 'ACTIVE',
        };

        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { address: { contains: q, mode: 'insensitive' } },
            ];
        }

        if (sportType) {
            where.courts = {
                some: {
                    sportType,
                    status: 'ACTIVE',
                },
            };
        }

        const [items, total] = await Promise.all([
            this.prisma.venue.findMany({
                where,
                skip: page * size,
                take: size,
                include: {
                    courts: {
                        select: { sportType: true },
                        where: { status: 'ACTIVE' },
                    },
                },
            }),
            this.prisma.venue.count({ where }),
        ]);

        // Map and calculate distance if coordinates provided
        const mappedItems: VenueWithDistance[] = items.map((venue) => {
            const domain = this.mapToDomain(venue);
            const sportTypes = [...new Set(venue.courts.map((c) => c.sportType))];

            let distanceKm: number | undefined;
            if (lat && lng) {
                distanceKm = this.calculateDistance(
                    lat,
                    lng,
                    Number(venue.latitude),
                    Number(venue.longitude),
                );
            }

            return {
                id: domain.id,
                ownerId: domain.ownerId,
                name: domain.name,
                address: domain.address,
                latitude: domain.latitude,
                longitude: domain.longitude,
                status: domain.status,
                createdAt: domain.createdAt,
                updatedAt: domain.updatedAt,
                sportTypes,
                distanceKm,
            } as VenueWithDistance;
        });

        // Filter by radius if provided
        const filteredItems = radiusKm
            ? mappedItems.filter((v) => v.distanceKm && v.distanceKm <= radiusKm)
            : mappedItems;

        // Sort by distance if coordinates provided
        if (lat && lng) {
            filteredItems.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        }

        return {
            items: filteredItems,
            page,
            size,
            total: radiusKm ? filteredItems.length : total,
        };
    }

    async findByOwnerId(ownerId: string): Promise<Venue[]> {
        const venues = await this.prisma.venue.findMany({
            where: { ownerId },
        });

        return venues.map(this.mapToDomain);
    }

    async findPolicyByVenueId(venueId: string): Promise<VenuePolicy | null> {
        const policy = await this.prisma.venuePolicy.findUnique({
            where: { venueId },
        });

        return policy ? this.mapPolicyToDomain(policy) : null;
    }

    private mapPolicyToDomain(record: any): VenuePolicy {
        return new VenuePolicy(
            record.id,
            record.venueId,
            record.holdTTL,
            record.allowExtendHold,
            record.cancelBeforeHours,
            record.refundRule as RefundRule,
            record.depositType as DepositType,
            Number(record.depositValue),
            record.createdAt,
            record.updatedAt,
        );
    }

    private mapToDomain(record: any): Venue {
        return new Venue({
            id: record.id,
            ownerId: record.ownerId,
            name: record.name,
            address: record.address,
            latitude: Number(record.latitude),
            longitude: Number(record.longitude),
            status: record.status as VenueStatus,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    // Haversine formula to calculate distance between two points
    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
