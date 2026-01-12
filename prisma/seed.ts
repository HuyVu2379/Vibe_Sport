// ===========================================
// PRISMA SEED SCRIPT
// Creates demo venue, courts, operating hours, and pricing rules
// ===========================================

import { PrismaClient, UserRole, SportType, DayOfWeek, DayType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const customer = await prisma.user.upsert({
        where: { email: 'customer@demo.com' },
        update: {},
        create: {
            email: 'customer@demo.com',
            phone: '0901234567',
            password: hashedPassword,
            fullName: 'Demo Customer',
            role: UserRole.CUSTOMER,
        },
    });
    console.log(`✅ Created customer: ${customer.email}`);

    const owner = await prisma.user.upsert({
        where: { email: 'owner@demo.com' },
        update: {},
        create: {
            email: 'owner@demo.com',
            phone: '0907654321',
            password: hashedPassword,
            fullName: 'Demo Owner',
            role: UserRole.OWNER,
        },
    });
    console.log(`✅ Created owner: ${owner.email}`);

    // 2. Create demo venue
    const venue = await prisma.venue.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            ownerId: owner.id,
            name: 'Sân Bóng Đá ABC',
            address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
            latitude: 10.7326,
            longitude: 106.7210,
        },
    });
    console.log(`✅ Created venue: ${venue.name}`);

    // 3. Create demo courts
    const court1 = await prisma.court.upsert({
        where: { id: '00000000-0000-0000-0000-000000000011' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000011',
            venueId: venue.id,
            name: 'Sân 1 - Mini',
            sportType: SportType.FOOTBALL,
        },
    });
    console.log(`✅ Created court: ${court1.name}`);

    const court2 = await prisma.court.upsert({
        where: { id: '00000000-0000-0000-0000-000000000012' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000012',
            venueId: venue.id,
            name: 'Sân 2 - Full Size',
            sportType: SportType.FOOTBALL,
        },
    });
    console.log(`✅ Created court: ${court2.name}`);

    // 4. Create operating hours for both courts (Mon-Sun, 06:00 - 22:00)
    const daysOfWeek = [
        DayOfWeek.MON,
        DayOfWeek.TUE,
        DayOfWeek.WED,
        DayOfWeek.THU,
        DayOfWeek.FRI,
        DayOfWeek.SAT,
        DayOfWeek.SUN,
    ];

    for (const court of [court1, court2]) {
        for (const day of daysOfWeek) {
            await prisma.operatingHours.upsert({
                where: {
                    courtId_dayOfWeek: {
                        courtId: court.id,
                        dayOfWeek: day,
                    },
                },
                update: {},
                create: {
                    courtId: court.id,
                    dayOfWeek: day,
                    openTime: '06:00',
                    closeTime: '22:00',
                    isClosed: false,
                },
            });
        }
    }
    console.log(`✅ Created operating hours for both courts`);

    // 5. Create pricing rules for both courts
    for (const court of [court1, court2]) {
        // Weekday off-peak (06:00 - 17:00)
        await prisma.pricingRule.upsert({
            where: {
                id: `${court.id}-weekday-offpeak`,
            },
            update: {},
            create: {
                id: `${court.id}-weekday-offpeak`,
                courtId: court.id,
                dayType: DayType.WEEKDAY,
                startTime: '06:00',
                endTime: '17:00',
                pricePerHour: 150000, // 150,000 VND
                isPeak: false,
            },
        });

        // Weekday peak (17:00 - 22:00)
        await prisma.pricingRule.upsert({
            where: {
                id: `${court.id}-weekday-peak`,
            },
            update: {},
            create: {
                id: `${court.id}-weekday-peak`,
                courtId: court.id,
                dayType: DayType.WEEKDAY,
                startTime: '17:00',
                endTime: '22:00',
                pricePerHour: 250000, // 250,000 VND
                isPeak: true,
            },
        });

        // Weekend all day
        await prisma.pricingRule.upsert({
            where: {
                id: `${court.id}-weekend`,
            },
            update: {},
            create: {
                id: `${court.id}-weekend`,
                courtId: court.id,
                dayType: DayType.WEEKEND,
                startTime: '06:00',
                endTime: '22:00',
                pricePerHour: 300000, // 300,000 VND
                isPeak: true,
            },
        });
    }
    console.log(`✅ Created pricing rules for both courts`);

    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('Demo credentials:');
    console.log('  Customer: customer@demo.com / password123');
    console.log('  Owner: owner@demo.com / password123');
    console.log('');
    console.log('Demo IDs:');
    console.log(`  Venue ID: ${venue.id}`);
    console.log(`  Court 1 ID: ${court1.id}`);
    console.log(`  Court 2 ID: ${court2.id}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
