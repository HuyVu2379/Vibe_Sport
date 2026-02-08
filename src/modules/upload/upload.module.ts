// ===========================================
// UPLOAD MODULE
// ===========================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CloudinaryProvider } from './cloudinary.provider';
import { UploadService } from './upload.service';
import { UploadController } from '../../interfaces/http/upload/upload.controller';
import { UPLOAD_SERVICE } from '../../application/ports';

@Module({
    imports: [ConfigModule],
    controllers: [UploadController],
    providers: [
        CloudinaryProvider,
        UploadService,
        { provide: UPLOAD_SERVICE, useClass: UploadService },
    ],
    exports: [UPLOAD_SERVICE, UploadService],
})
export class UploadModule { }
