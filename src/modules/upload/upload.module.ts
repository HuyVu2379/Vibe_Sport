// ===========================================
// UPLOAD MODULE
// ===========================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
    imports: [ConfigModule],
    controllers: [UploadController],
    providers: [CloudinaryProvider, UploadService],
    exports: [UploadService],
})
export class UploadModule { }
