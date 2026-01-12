// ===========================================
// INTERFACES LAYER - Owner Controller
// ===========================================

import {
    Controller,
    Get,
    Post,
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

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { UserRole } from '../../../domain/entities/user.entity';

import {
    GetOwnerBookingsUseCase,
    CancelBookingUseCase,
} from '../../../application/use-cases/bookings';

import {
    GetOwnerBookingsQueryDto,
    OwnerBookingsListResponseDto,
    OwnerCancelBookingDto,
    CancelResponseDto,
} from './owner.dto';

interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

@ApiTags('Owner')
@ApiBearerAuth()
@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class OwnerBookingsController {
    constructor(
        private readonly getOwnerBookingsUseCase: GetOwnerBookingsUseCase,
        private readonly cancelBookingUseCase: CancelBookingUseCase,
    ) { }

    @Get('bookings')
    @ApiOperation({ summary: 'Get owner bookings' })
    @ApiResponse({ status: 200, type: OwnerBookingsListResponseDto })
    async getOwnerBookings(
        @Query() query: GetOwnerBookingsQueryDto,
        @CurrentUser() user: AuthUser,
    ): Promise<OwnerBookingsListResponseDto> {
        const result = await this.getOwnerBookingsUseCase.execute({
            ownerId: user.userId,
            courtId: query.courtId,
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
                customer: {
                    userId: item.customer.userId,
                    fullName: item.customer.fullName,
                    phone: item.customer.phone,
                },
            })),
            page: result.page,
            size: result.size,
            total: result.total,
        };
    }

    @Post('bookings/:bookingId/cancel')
    @ApiOperation({ summary: 'Cancel a booking (owner)' })
    @ApiParam({ name: 'bookingId', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, type: CancelResponseDto })
    async cancelBooking(
        @Param('bookingId', ParseUUIDPipe) bookingId: string,
        @Body() dto: OwnerCancelBookingDto,
        @CurrentUser() user: AuthUser,
    ): Promise<CancelResponseDto> {
        const result = await this.cancelBookingUseCase.execute({
            bookingId,
            userId: user.userId,
            reason: dto.reason,
            isOwner: true,
        });

        return {
            bookingId: result.bookingId,
            status: result.status,
        };
    }
}
