export default () => ({
    // Application
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',

    // Database - Neon PostgreSQL
    database: {
        url: process.env.DATABASE_URL,
    },

    // Redis - Upstash
    upstash: {
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_TOKEN,
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    // Booking
    booking: {
        holdTtlMinutes: parseInt(process.env.HOLD_TTL_MINUTES ?? '5', 10),
    },

    // Rate Limiting
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'debug',
});
