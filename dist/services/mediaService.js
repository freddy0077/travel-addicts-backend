"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaService = exports.MediaService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
class MediaService {
    constructor() {
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.bucket = process.env.AWS_S3_BUCKET || 'travel-addicts-media';
        this.cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }
    /**
     * Generate a presigned URL for direct client-side upload
     */
    async generatePresignedUploadUrl(filename, contentType, folder = 'uploads') {
        const fileExtension = path_1.default.extname(filename);
        const uniqueFilename = `${(0, uuid_1.v4)()}${fileExtension}`;
        const key = `${folder}/${uniqueFilename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
            ACL: 'public-read',
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
        const publicUrl = this.getPublicUrl(key);
        return {
            uploadUrl,
            key,
            publicUrl,
        };
    }
    /**
     * Upload file buffer directly to S3
     */
    async uploadFile(buffer, filename, contentType, folder = 'uploads') {
        const fileExtension = path_1.default.extname(filename);
        const uniqueFilename = `${(0, uuid_1.v4)()}${fileExtension}`;
        const key = `${folder}/${uniqueFilename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
        });
        await this.s3Client.send(command);
        return {
            url: this.getPublicUrl(key),
            key,
            bucket: this.bucket,
            filename: uniqueFilename,
            size: buffer.length,
            contentType,
        };
    }
    /**
     * Delete file from S3
     */
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.s3Client.send(command);
    }
    /**
     * Generate a presigned URL for downloading/viewing a private file
     */
    async generatePresignedDownloadUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    /**
     * Get public URL for a file
     */
    getPublicUrl(key) {
        if (this.cloudFrontDomain) {
            return `https://${this.cloudFrontDomain}/${key}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    /**
     * Extract S3 key from URL
     */
    extractKeyFromUrl(url) {
        try {
            // Handle CloudFront URLs
            if (this.cloudFrontDomain && url.includes(this.cloudFrontDomain)) {
                return url.split(`${this.cloudFrontDomain}/`)[1];
            }
            // Handle direct S3 URLs
            if (url.includes('.s3.')) {
                const parts = url.split('.s3.');
                if (parts.length > 1) {
                    const pathPart = parts[1].split('/').slice(1).join('/');
                    return pathPart;
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error extracting key from URL:', error);
            return null;
        }
    }
    /**
     * Validate file type
     */
    isValidImageType(contentType) {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        return allowedTypes.includes(contentType.toLowerCase());
    }
    /**
     * Validate file size (in bytes)
     */
    isValidFileSize(size, maxSize = 10 * 1024 * 1024) {
        return size <= maxSize;
    }
    /**
     * Get recommended image dimensions for different use cases
     */
    getRecommendedDimensions(type) {
        const dimensions = {
            hero: { width: 1920, height: 1080, minWidth: 1200, minHeight: 675 }, // 16:9 ratio
            gallery: { width: 1200, height: 800, minWidth: 800, minHeight: 533 }, // 3:2 ratio
            thumbnail: { width: 400, height: 300, minWidth: 300, minHeight: 225 }, // 4:3 ratio
            general: { width: 800, height: 600, minWidth: 400, minHeight: 300 }
        };
        return dimensions[type];
    }
    /**
     * Validate image dimensions (requires image processing library in production)
     */
    async validateImageDimensions(buffer, type = 'general') {
        // For now, we'll skip actual dimension validation since it requires additional libraries
        // In production, you'd use sharp or similar to check actual dimensions
        const recommended = this.getRecommendedDimensions(type);
        return {
            valid: true,
            message: `Recommended dimensions: ${recommended.width}x${recommended.height}px (minimum: ${recommended.minWidth}x${recommended.minHeight}px)`
        };
    }
    /**
     * Generate folder path based on content type
     */
    getFolderPath(contentType) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${contentType}/${year}/${month}`;
    }
}
exports.MediaService = MediaService;
// Export singleton instance
exports.mediaService = new MediaService();
