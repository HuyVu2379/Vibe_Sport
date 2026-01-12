import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NeonDatabaseService } from './neon-database.service';

@Global()
@Module({
    providers: [PrismaService, NeonDatabaseService],
    exports: [PrismaService, NeonDatabaseService],
})
export class PrismaModule { }
