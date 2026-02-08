// ===========================================
// INTERFACES LAYER - Upload Controller
// ===========================================

import {
    Controller,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    UseGuards,
    Body,
    Inject,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IUploadService, UPLOAD_SERVICE, UploadResult } from '../../../application/ports';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
    constructor(
        @Inject(UPLOAD_SERVICE)
        private readonly uploadService: IUploadService,
    ) { }

    @Post('image')
    @ApiOperation({ summary: 'Upload a single image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string', example: 'venues' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('folder') folder?: string,
    ): Promise<UploadResult> {
        return this.uploadService.uploadImage(file, folder || 'vibe-sport/images');
    }

    @Post('images')
    @ApiOperation({ summary: 'Upload multiple images (max 10)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
                folder: { type: 'string', example: 'venues' },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadImages(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            }),
        )
        files: Express.Multer.File[],
        @Body('folder') folder?: string,
    ): Promise<UploadResult[]> {
        return this.uploadService.uploadFiles(files, folder || 'vibe-sport/images');
    }

    @Post('video')
    @ApiOperation({ summary: 'Upload a video' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string', example: 'videos' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_VIDEO_SIZE }),
                    new FileTypeValidator({ fileType: /(mp4|mov|avi|webm)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('folder') folder?: string,
    ): Promise<UploadResult> {
        return this.uploadService.uploadVideo(file, folder || 'vibe-sport/videos');
    }

    @Post('file')
    @ApiOperation({ summary: 'Upload any file (image, video, document)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folder: { type: 'string', example: 'documents' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: MAX_VIDEO_SIZE })],
            }),
        )
        file: Express.Multer.File,
        @Body('folder') folder?: string,
    ): Promise<UploadResult> {
        return this.uploadService.uploadFile(file, folder || 'vibe-sport/files');
    }

    @Delete(':publicId')
    @ApiOperation({ summary: 'Delete an uploaded file by public ID' })
    async deleteFile(@Param('publicId') publicId: string): Promise<{ result: string }> {
        return this.uploadService.deleteFile(publicId);
    }
}
