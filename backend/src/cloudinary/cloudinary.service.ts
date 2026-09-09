import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload a Multer file buffer to Cloudinary via an upload stream.
   * Returns the secure URL and public_id of the uploaded asset.
   * If Cloudinary is not configured, generates a local data URI fallback for local dev.
   */
  uploadImage(
    file: Express.Multer.File,
  ): Promise<{ secure_url: string; public_id: string }> {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');

    if (!cloudName || cloudName === 'your_cloud_name') {
      this.logger.warn(
        'Cloudinary credentials not set. Using base64 data URI fallback for local development.',
      );
      const mime = file.mimetype || 'image/png';
      const base64 = file.buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64}`;
      const mockId = `local_mock_${Date.now()}`;
      return Promise.resolve({ secure_url: dataUri, public_id: mockId });
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'roadwise/questions',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(error);
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete an image from Cloudinary by its public_id.
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Failed to delete Cloudinary image: ${publicId}`, error);
    }
  }
}
