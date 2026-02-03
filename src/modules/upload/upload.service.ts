// ===========================================
// UPLOAD SERVICE - Cloudinary Integration
// ===========================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface UploadResult {
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    resourceType: string;
}

@Injectable()
export class UploadService {
    /**
     * Upload a single file to Cloudinary
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'vibe-sport',
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(new BadRequestException(`Upload failed: ${error.message}`));
                    } else if (result) {
                        resolve({
                            publicId: result.public_id,
                            url: result.url,
                            secureUrl: result.secure_url,
                            format: result.format,
                            width: result.width,
                            height: result.height,
                            resourceType: result.resource_type,
                        });
                    }
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    /**
     * Upload multiple files to Cloudinary
     */
    async uploadFiles(
        files: Express.Multer.File[],
        folder: string = 'vibe-sport',
    ): Promise<UploadResult[]> {
        const uploadPromises = files.map((file) => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Delete a file from Cloudinary by public ID
     */
    async deleteFile(publicId: string): Promise<{ result: string }> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            throw new BadRequestException(`Delete failed: ${error.message}`);
        }
    }

    /**
     * Delete multiple files from Cloudinary
     */
    async deleteFiles(publicIds: string[]): Promise<{ deleted: Record<string, string> }> {
        try {
            const result = await cloudinary.api.delete_resources(publicIds);
            return result;
        } catch (error) {
            throw new BadRequestException(`Bulk delete failed: ${error.message}`);
        }
    }

    /**
     * Upload image with transformations
     */
    async uploadImage(
        file: Express.Multer.File,
        folder: string = 'vibe-sport/images',
        options?: {
            width?: number;
            height?: number;
            crop?: string;
            quality?: number;
        },
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const transformation: any = {};

            if (options?.width) transformation.width = options.width;
            if (options?.height) transformation.height = options.height;
            if (options?.crop) transformation.crop = options.crop;
            if (options?.quality) transformation.quality = options.quality;

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    transformation: Object.keys(transformation).length > 0 ? transformation : undefined,
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(new BadRequestException(`Image upload failed: ${error.message}`));
                    } else if (result) {
                        resolve({
                            publicId: result.public_id,
                            url: result.url,
                            secureUrl: result.secure_url,
                            format: result.format,
                            width: result.width,
                            height: result.height,
                            resourceType: result.resource_type,
                        });
                    }
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    /**
     * Upload video to Cloudinary
     */
    async uploadVideo(
        file: Express.Multer.File,
        folder: string = 'vibe-sport/videos',
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'video',
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(new BadRequestException(`Video upload failed: ${error.message}`));
                    } else if (result) {
                        resolve({
                            publicId: result.public_id,
                            url: result.url,
                            secureUrl: result.secure_url,
                            format: result.format,
                            width: result.width,
                            height: result.height,
                            resourceType: result.resource_type,
                        });
                    }
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}
