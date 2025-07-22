import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export class MediaService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private cloudFrontDomain?: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucket = process.env.AWS_S3_BUCKET || 'travel-addicts-media';
    this.cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

    this.s3Client = new S3Client({
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
  async generatePresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<PresignedUrlResult> {
    const fileExtension = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
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
  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    const fileExtension = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${uniqueFilename}`;

    const command = new PutObjectCommand({
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
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Generate a presigned URL for downloading/viewing a private file
   */
  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Extract S3 key from URL
   */
  extractKeyFromUrl(url: string): string | null {
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
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }

  /**
   * Validate file type
   */
  isValidImageType(contentType: string): boolean {
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
  isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean { // 10MB default
    return size <= maxSize;
  }

  /**
   * Get recommended image dimensions for different use cases
   */
  getRecommendedDimensions(type: 'hero' | 'gallery' | 'thumbnail' | 'general') {
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
  async validateImageDimensions(buffer: Buffer, type: 'hero' | 'gallery' | 'thumbnail' | 'general' = 'general'): Promise<{ valid: boolean; message?: string }> {
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
  getFolderPath(contentType: 'destination' | 'tour' | 'blog' | 'user' | 'general'): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    return `${contentType}/${year}/${month}`;
  }
}

// Export singleton instance
export const mediaService = new MediaService();
