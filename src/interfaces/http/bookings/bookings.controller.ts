// ===========================================
// INTERFACES LAYER - Bookings Controller
// Based on API Contract v1.0
// ===========================================

import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

import {
    CreateHoldUseCase,
    ConfirmBookingUseCase,
    CancelBookingUseCase,
    GetMyBookingsUseCase,
} from '../../../application/use-cases/bookings';

import {
    CreateHoldDto,
    ConfirmBookingDto,
    CancelBookingDto,
    GetMyBookingsQueryDto,
    HoldResponseDto,
    ConfirmResponseDto,
    CancelResponseDto,
    BookingsListResponseDto,
} from './bookings.dto';

interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
    constructor(
        private readonly createHoldUseCase: CreateHoldUseCase,
        private readonly confirmBookingUseCase: ConfirmBookingUseCase,
        private readonly cancelBookingUseCase: CancelBookingUseCase,
        private readonly getMyBookingsUseCase: GetMyBookingsUseCase,
    ) { }

    @Post('hold')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Rate limit: 5 per minute
    @ApiOperation({ summary: 'Create a hold on a slot' })
    @ApiResponse({ status: 201, type: HoldResponseDto })
    @ApiResponse({ status: 409, description: 'Slot already held/confirmed' })
    @ApiResponse({ status: 400, description: 'Outside operating hours or invalid time' })
    async createHold(
        @Body() dto: CreateHoldDto,
        @CurrentUser() user: AuthUser,
    ): Promise<HoldResponseDto> {
        const result = await this.createHoldUseCase.execute({
            userId: user.userId,
            courtId: dto.courtId,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
        });

        return {
            bookingId: result.bookingId,
            status: result.status,
            holdExpiresAt: result.holdExpiresAt.toISOString(),
            totalPrice: result.totalPrice,
        };
    }

    @Post(':bookingId/confirm')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Rate limit: 5 per minute
    @ApiOperation({ summary: 'Confirm a held booking' })
    @ApiParam({ name: 'bookingId', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, type: ConfirmResponseDto })
    @ApiResponse({ status: 410, description: 'Hold expired' })
    @ApiResponse({ status: 409, description: 'Slot already confirmed by others' })
    async confirmBooking(
        @Param('bookingId', ParseUUIDPipe) bookingId: string,
        @Body() dto: ConfirmBookingDto,
        @CurrentUser() user: AuthUser,
    ): Promise<ConfirmResponseDto> {
        const result = await this.confirmBookingUseCase.execute({
            bookingId,
            userId: user.userId,
            note: dto.note,
        });

        return {
            bookingId: result.bookingId,
            status: result.status,
            courtId: result.courtId,
            startTime: result.startTime.toISOString(),
            endTime: result.endTime.toISOString(),
            totalPrice: result.totalPrice,
        };
    }

    @Post(':bookingId/cancel')
    @ApiOperation({ summary: 'Cancel a booking (customer)' })
    @ApiParam({ name: 'bookingId', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, type: CancelResponseDto })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    @ApiResponse({ status: 400, description: 'Invalid transition' })
    async cancelBooking(
        @Param('bookingId', ParseUUIDPipe) bookingId: string,
        @Body() dto: CancelBookingDto,
        @CurrentUser() user: AuthUser,
    ): Promise<CancelResponseDto> {
        const result = await this.cancelBookingUseCase.execute({
            bookingId,
            userId: user.userId,
            reason: dto.reason,
            isOwner: false,
        });

        return {
            bookingId: result.bookingId,
            status: result.status,
        };
    }
}

@ApiTags('My Bookings')
@ApiBearerAuth()
@Controller('me/bookings')
@UseGuards(JwtAuthGuard)
export class MyBookingsController {
    constructor(private readonly getMyBookingsUseCase: GetMyBookingsUseCase) { }

    @Get()
    @ApiOperation({ summary: 'Get my bookings' })
    @ApiResponse({ status: 200, type: BookingsListResponseDto })
    async getMyBookings(
        @Query() query: GetMyBookingsQueryDto,
        @CurrentUser() user: AuthUser,
    ): Promise<BookingsListResponseDto> {
        const result = await this.getMyBookingsUseCase.execute({
            userId: user.userId,
            status: query.status,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            page: query.page,
            size: query.size,
        });

        return {
            items: result.items.map((item) => ({
                bookingId: item.bookingId,
                status: item.status,
                courtId: item.courtId,
                startTime: item.startTime.toISOString(),
                endTime: item.endTime.toISOString(),
                totalPrice: item.totalPrice,
                createdAt: item.createdAt.toISOString(),
            })),
            page: result.page,
            size: result.size,
            total: result.total,
        };
    }
}
