// ===========================================
// APPLICATION LAYER - Get Venue Analytics Use Case
// ===========================================

import { Inject, Injectable } from '@nestjs/common';
import { IAnalyticsRepository, ANALYTICS_REPOSITORY, AnalyticsSummary } from '../../ports/analytics.repository.port';

export interface GetVenueAnalyticsInput {
    venueId: string;
    from: Date;
    to: Date;
}

@Injectable()
export class GetVenueAnalyticsUseCase {
    constructor(
        @Inject(ANALYTICS_REPOSITORY)
        private readonly analyticsRepository: IAnalyticsRepository,
    ) { }

    async execute(input: GetVenueAnalyticsInput): Promise<AnalyticsSummary> {
        const { venueId, from, to } = input;
        return this.analyticsRepository.getVenueAnalytics(venueId, from, to);
    }
}
