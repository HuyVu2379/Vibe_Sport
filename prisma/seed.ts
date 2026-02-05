// ===========================================
// PRISMA SEED SCRIPT
// Creates demo venue, courts, operating hours, pricing rules, amenities, policies, bookings, and reviews.
// ===========================================

import {
    PrismaClient,
    UserRole,
    SportType,
    DayOfWeek,
    DayType,
    BookingStatus,
    PaymentStatus,
    PaymentMethod,
    ConversationType,
    MessageType,
    ActorType
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- Helpers ---
const getRandomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
const getRandomSubset = <T>(items: T[], min: number, max: number): T[] => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, getRandomInt(min, max));
};

// Date helpers
const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 3600000);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const subtractDays = (date: Date, days: number) => new Date(date.getTime() - days * 86400000);

const AMENITIES_LIST = [
    { name: 'Wifi', code: 'WIFI', icon: 'wifi' },
    { name: 'Parking', code: 'PARKING', icon: 'local_parking' },
    { name: 'Air Conditioning', code: 'AC', icon: 'ac_unit' },
    { name: 'Shower', code: 'SHOWER', icon: 'shower' },
    { name: 'Locker', code: 'LOCKER', icon: 'lock' },
    { name: 'Water', code: 'WATER', icon: 'water_drop' },
    { name: 'Ball Rental', code: 'BALL_RENTAL', icon: 'sports_soccer' },
    { name: 'Shoe Rental', code: 'SHOE_RENTAL', icon: 'hiking' },
    { name: 'Canteen', code: 'CANTEEN', icon: 'restaurant' },
    { name: 'First Aid', code: 'FIRST_AID', icon: 'medical_services' },
];

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Amenities
    const amenityMap = new Map<string, string>(); // name -> id
    for (const item of AMENITIES_LIST) {
        const amenity = await prisma.amenity.upsert({
            where: { name: item.name },
            update: {},
            create: item
        });
        amenityMap.set(item.name, amenity.id);
    }
    console.log(`✅ Seeded ${amenityMap.size} amenities`);

    // 2. Create demo users
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

    // Create a few extra random users for bookings
    const randomUsers: any[] = [];
    for (let i = 1; i <= 5; i++) {
        const u = await prisma.user.upsert({
            where: { email: `user${i}@test.com` },
            update: {},
            create: {
                email: `user${i}@test.com`,
                phone: `098765432${i}`,
                password: hashedPassword,
                fullName: `Test User ${i}`,
                role: UserRole.CUSTOMER
            }
        });
        randomUsers.push(u);
    }
    randomUsers.push(customer); // Add demo customer to the pool

    // 3. Create demo venue
    const venue = await prisma.venue.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            ownerId: owner.id,
            name: 'Sân Bóng Đá ABC',
            description: 'Sân bóng đá cỏ nhân tạo chất lượng cao, có đèn chiếu sáng, bãi giữ xe rộng rãi.',
            address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
            latitude: 10.7326,
            longitude: 106.7210,
            imageUrls: [
                'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1575361204480-aadea252468e?auto=format&fit=crop&q=80&w=1000'
            ]
        },
    });

    // 3b. Demo Venue Policy
    await prisma.venuePolicy.upsert({
        where: { venueId: venue.id },
        update: {},
        create: {
            venueId: venue.id,
            holdTTL: 30,
            cancelBeforeHours: 12,
            depositType: 'PERCENT',
            depositValue: 30,
            refundRule: 'PARTIAL'
        }
    });

    // 3c. Demo Venue Amenities
    const demoAmenities = ['Wifi', 'Parking', 'Shower', 'Water'];
    for (const name of demoAmenities) {
        const amId = amenityMap.get(name);
        if (amId) {
            await prisma.venueAmenity.upsert({
                where: { venueId_amenityId: { venueId: venue.id, amenityId: amId } },
                update: {},
                create: { venueId: venue.id, amenityId: amId }
            });
        }
    }

    // 4. Create demo courts
    const court1 = await prisma.court.upsert({
        where: { id: '00000000-0000-0000-0000-000000000011' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000011',
            venueId: venue.id,
            name: 'Sân 1 - Mini',
            sportType: SportType.FOOTBALL,
            imageUrls: ['https://images.unsplash.com/photo-1518605348433-e341904d6735?auto=format&fit=crop&q=80&w=500']
        },
    });

    const court2 = await prisma.court.upsert({
        where: { id: '00000000-0000-0000-0000-000000000012' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000012',
            venueId: venue.id,
            name: 'Sân 2 - Full Size',
            sportType: SportType.FOOTBALL,
            imageUrls: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=500']
        },
    });

    // 5. Operating Hours (For Venue)
    const daysOfWeek = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI, DayOfWeek.SAT, DayOfWeek.SUN];
    for (const day of daysOfWeek) {
        await prisma.operatingHours.upsert({
            where: { venueId_dayOfWeek: { venueId: venue.id, dayOfWeek: day } },
            update: {},
            create: { venueId: venue.id, dayOfWeek: day, openTime: '06:00', closeTime: '22:00' },
        });
    }

    // Pricing Rules (Per Court) -- Moved inside Court context or separate
    for (const court of [court1, court2]) {
        // Pricing
        await prisma.pricingRule.upsert({
            where: { id: `${court.id}-weekday-offpeak` },
            update: {},
            create: {
                id: `${court.id}-weekday-offpeak`,
                courtId: court.id,
                dayType: DayType.WEEKDAY,
                startTime: '06:00',
                endTime: '17:00',
                pricePerHour: 150000,
            },
        });
        await prisma.pricingRule.upsert({
            where: { id: `${court.id}-weekday-peak` },
            update: {},
            create: {
                id: `${court.id}-weekday-peak`,
                courtId: court.id,
                dayType: DayType.WEEKDAY,
                startTime: '17:00',
                endTime: '22:00',
                pricePerHour: 250000,
                isPeak: true,
            },
        });
        await prisma.pricingRule.upsert({
            where: { id: `${court.id}-weekend` },
            update: {},
            create: {
                id: `${court.id}-weekend`,
                courtId: court.id,
                dayType: DayType.WEEKEND,
                startTime: '06:00',
                endTime: '22:00',
                pricePerHour: 300000,
                isPeak: true,
            },
        });
    }

    // --- GENERATE RANDOM VENUES (Enhanced) ---
    console.log('🌱 Generating random venues with full data...');

    // Config
    const NUM_VENUES = 20;

    const firstNames = ['Minh', 'Hùng', 'Tuấn', 'Dũng', 'Lan', 'Mai', 'Cường', 'thành', 'Kiên', 'Vy'];
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
    const venuePrefixes = ['Sân bóng', 'CLB Thể Thao', 'Sân Vận Động', 'Trung Tâm TDTT', 'Arena', 'Sport Complex'];
    const streets = ['Nguyễn Văn Linh', 'Lê Văn Lương', 'Huỳnh Tấn Phát', 'Nguyễn Hữu Thọ', 'Phạm Hùng', 'Nguyễn Thị Thập'];
    const districts = ['Quận 7', 'Nhà Bè', 'Bình Chánh', 'Quận 4', 'Quận 8'];

    const generateRandomCoordinate = (center: number, radius = 0.05): number => center + (Math.random() - 0.5) * radius;

    for (let i = 1; i <= NUM_VENUES; i++) {
        // Owner
        const ownerEmail = `owner.seed${i}@demo.com`;
        const ownerName = `${getRandomItem(lastNames)} ${getRandomItem(firstNames)}`;
        const seedOwner = await prisma.user.upsert({
            where: { email: ownerEmail },
            update: {},
            create: {
                email: ownerEmail,
                phone: `09${getRandomInt(10000000, 99999999)}`,
                password: hashedPassword,
                fullName: ownerName,
                role: UserRole.OWNER,
            },
        });

        // Venue
        const venueName = `${getRandomItem(venuePrefixes)} ${getRandomItem(firstNames)} ${i}`;
        const venueAddress = `${getRandomInt(1, 999)} ${getRandomItem(streets)}, ${getRandomItem(districts)}, TP.HCM`;
        const sportImages = [
            'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1626224583764-84786c713064?auto=format&fit=crop&q=80&w=1000'
        ];

        const seedVenue = await prisma.venue.create({
            data: {
                ownerId: seedOwner.id,
                name: venueName,
                description: `Sân thể thao chất lượng cao tại khu vực ${venueAddress}. Mặt sân tốt, dịch vụ chu đáo.`,
                address: venueAddress,
                latitude: generateRandomCoordinate(10.7326),
                longitude: generateRandomCoordinate(106.7210),
                imageUrls: [getRandomItem(sportImages)]
            }
        });

        // Operating Hours (For Venue)
        for (const day of daysOfWeek) {
            await prisma.operatingHours.create({
                data: { venueId: seedVenue.id, dayOfWeek: day, openTime: '06:00', closeTime: '22:00' }
            });
        }

        // Policy
        await prisma.venuePolicy.create({
            data: {
                venueId: seedVenue.id,
                holdTTL: getRandomItem([15, 30, 45]),
                cancelBeforeHours: getRandomItem([12, 24, 48]),
                depositType: getRandomItem(['NONE', 'PERCENT']),
                depositValue: 30,
            }
        });

        // Amenities
        const venueAmenities = getRandomSubset(AMENITIES_LIST, 3, 8);
        for (const am of venueAmenities) {
            const amId = amenityMap.get(am.name);
            if (amId) {
                await prisma.venueAmenity.create({
                    data: { venueId: seedVenue.id, amenityId: amId }
                });
            }
        }

        // Courts
        const numCourts = getRandomInt(1, 3);
        const courts: any[] = [];
        for (let c = 1; c <= numCourts; c++) {
            const isFootball = Math.random() > 0.3;
            const sportType = isFootball ? SportType.FOOTBALL : SportType.BADMINTON;

            const court = await prisma.court.create({
                data: {
                    venueId: seedVenue.id,
                    name: `Sân ${c} - ${isFootball ? 'Bóng đá' : 'Cầu lông'}`,
                    sportType: sportType,
                    imageUrls: [isFootball
                        ? 'https://images.unsplash.com/photo-1518605348433-e341904d6735?auto=format&fit=crop&q=80&w=500'
                        : 'https://images.unsplash.com/photo-1626224583764-84786c713064?auto=format&fit=crop&q=80&w=500'
                    ]
                }
            });
            courts.push(court);

            // Pricing Rules (Per Court)
            const basePrice = isFootball ? 200000 : 80000;
            await prisma.pricingRule.createMany({
                data: [
                    { courtId: court.id, dayType: DayType.WEEKDAY, startTime: '06:00', endTime: '17:00', pricePerHour: basePrice, isPeak: false },
                    { courtId: court.id, dayType: DayType.WEEKDAY, startTime: '17:00', endTime: '22:00', pricePerHour: basePrice * 1.5, isPeak: true },
                    { courtId: court.id, dayType: DayType.WEEKEND, startTime: '06:00', endTime: '22:00', pricePerHour: basePrice * 1.5, isPeak: true }
                ]
            });
        }

        // --- GENERATE BOOKINGS FOR THIS VENUE ---
        // Generate bookings for the past 30 days and next 14 days
        const numBookings = getRandomInt(5, 15);
        for (let b = 0; b < numBookings; b++) {
            const court = getRandomItem(courts);
            const user = getRandomItem(randomUsers);

            // Determine date: mostly past (completed), some future (confirmed/pending)
            const isPast = Math.random() > 0.3;
            const dateOffset = isPast ? -getRandomInt(1, 30) : getRandomInt(1, 14);
            const bookingDate = addDays(new Date(), dateOffset);

            // Random hour between 6 and 20
            const startHour = getRandomInt(6, 20);
            const startTime = new Date(bookingDate);
            startTime.setHours(startHour, 0, 0, 0);
            const duration = getRandomItem([1, 1.5, 2]);
            const endTime = addMinutes(startTime, duration * 60);

            // Calculate price (approx)
            const price = 200000 * duration;

            // Determine Status
            let status: BookingStatus = BookingStatus.CONFIRMED;
            let paymentStatus: PaymentStatus = PaymentStatus.COMPLETED;

            if (isPast) {
                status = BookingStatus.COMPLETED;
            } else {
                status = Math.random() > 0.2 ? BookingStatus.CONFIRMED : BookingStatus.HOLD;
                paymentStatus = status === BookingStatus.CONFIRMED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
            }

            // Occasional Cancelled
            if (Math.random() < 0.1) {
                status = BookingStatus.CANCELLED_BY_USER;
                paymentStatus = PaymentStatus.REFUNDED;
            }

            const booking = await prisma.booking.create({
                data: {
                    userId: user.id,
                    courtId: court.id,
                    startTime: startTime,
                    endTime: endTime,
                    status: status,
                    paymentStatus: paymentStatus,
                    totalPrice: price,
                    depositAmount: status === BookingStatus.HOLD ? 0 : price * 0.3,
                    refCode: `BK${Date.now()}${getRandomInt(100, 999)}`,
                    createdAt: subtractDays(bookingDate, getRandomInt(1, 5)), // Booked 1-5 days before
                }
            });

            // Create Payment if confirmed/completed
            if (status === BookingStatus.COMPLETED || status === BookingStatus.CONFIRMED) {
                await prisma.payment.create({
                    data: {
                        bookingId: booking.id,
                        userId: user.id,
                        amount: booking.totalPrice,
                        method: PaymentMethod.E_WALLET,
                        status: PaymentStatus.COMPLETED,
                        transactionId: `TXN${Date.now()}${getRandomInt(1000, 9999)}`
                    }
                });
            }

            // Create Review if Completed (50% chance)
            if (status === BookingStatus.COMPLETED && Math.random() > 0.5) {
                const rating = getRandomInt(3, 5);
                const comments = [
                    'Sân đẹp, mặt cỏ tốt.',
                    'Chủ sân nhiệt tình, sẽ quay lại.',
                    'Giá hơi cao nhưng chất lượng ổn.',
                    'Đèn hơi tối một chút ở góc sân.',
                    'Tuyệt vời!'
                ];
                await prisma.review.create({
                    data: {
                        bookingId: booking.id,
                        venueId: seedVenue.id,
                        userId: user.id,
                        rating: rating,
                        comment: getRandomItem(comments),
                        reply: rating < 4 ? 'Cảm ơn bạn đã góp ý, chúng tôi sẽ cải thiện.' : undefined
                    }
                });
            }
        }

        // --- GENERATE CONVERSATIONS ---
        if (Math.random() > 0.5) {
            const user = getRandomItem(randomUsers);
            const conv = await prisma.conversation.create({
                data: {
                    type: ConversationType.VENUE_INQUIRY,
                    venueId: seedVenue.id,
                    lastMessage: 'Sân mình còn trống sáng thứ 7 không ạ?',
                    lastMessageAt: new Date(),
                }
            });

            // Participants
            await prisma.participant.createMany({
                data: [
                    { conversationId: conv.id, userId: user.id },
                    { conversationId: conv.id, userId: seedOwner.id }
                ]
            });

            // Messages
            await prisma.message.create({
                data: {
                    conversationId: conv.id,
                    senderId: user.id,
                    content: 'Sân mình còn trống sáng thứ 7 không ạ?',
                    type: MessageType.TEXT
                }
            });
        }

        console.log(`✅ Generated venue ${i}: ${venueName} (Bookings: ${numBookings})`);
    }

    console.log('');
    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
