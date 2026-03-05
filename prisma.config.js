// Prisma 7 configuration file (plain JS - no TypeScript required)
// This file tells Prisma CLI where to find the schema.
// Database URL is passed via PrismaNeon adapter in prisma.service.ts at runtime.

/** @type {{ schema: string }} */
module.exports = {
    schema: 'prisma/schema.prisma',
};
