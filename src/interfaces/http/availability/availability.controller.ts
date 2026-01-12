// ===========================================
// INTERFACES LAYER - Availability Controller
// ===========================================

import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { AvailabilityService } from '../../../modules/availability/availability.service';
import { AvailabilityResponseDto, GetAvailabilityQueryDto } from './availability.dto';

@ApiTags('Availability')
@Controller('courts')
export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) { }

    @Get(':courtId/availability')
    @Public()
    @ApiOperation({ summary: 'Get court availability for a specific date' })
    @ApiParam({ name: 'courtId', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, type: AvailabilityResponseDto })
    @ApiResponse({ status: 404, description: 'Court not found' })
    async getAvailability(
        @Param('courtId', ParseUUIDPipe) courtId: string,
        @Query() query: GetAvailabilityQueryDto,
    ): Promise<AvailabilityResponseDto> {
        const date = new Date(query.date);
        const slots = await this.availabilityService.getAvailability(courtId, date);

        return {
            courtId,
            date: query.date,
            slots: slots.map((slot) => ({
                startTime: slot.startTime.toISOString(),
                endTime: slot.endTime.toISOString(),
                status: slot.status,
                price: slot.price,
            })),
        };
    }
}
