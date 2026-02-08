// ===========================================
// APPLICATION LAYER - Upload Service Port
// ===========================================

export interface UploadResult {
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    resourceType: string;
}

export interface UploadOptions {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
}

export interface IUploadService {
    uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    uploadFiles(files: Express.Multer.File[], folder?: string): Promise<UploadResult[]>;
    uploadImage(file: Express.Multer.File, folder?: string, options?: UploadOptions): Promise<UploadResult>;
    uploadVideo(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    deleteFile(publicId: string): Promise<{ result: string }>;
    deleteFiles(publicIds: string[]): Promise<{ deleted: Record<string, string> }>;
}

export const UPLOAD_SERVICE = Symbol('UPLOAD_SERVICE');
