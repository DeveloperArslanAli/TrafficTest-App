import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import * as https from 'https';

export interface PexelsPhoto {
  id: number;
  alt: string;
  photographer: string;
  photographerUrl: string;
  url: string;
  dimensions: { width: number; height: number };
  urls: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  };
}

@Injectable()
export class AdminMediaService {
  private readonly logger = new Logger(AdminMediaService.name);
  private readonly pexelsApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly configService: ConfigService,
  ) {
    this.pexelsApiKey =
      this.configService.get<string>('PEXELS_API_KEY') ||
      'u7sdsvstjoD41Bw2Lc4mOJltq8ecJ9eaLrlcQL26zcpUljMKVGXl9sl8';
  }

  /**
   * Search Pexels API for traffic and driving scenario photos.
   */
  async searchPexels(
    query: string,
    page = 1,
    perPage = 15,
    orientation?: string,
  ): Promise<{
    totalResults: number;
    page: number;
    perPage: number;
    photos: PexelsPhoto[];
  }> {
    if (!query || query.trim().length === 0) {
      query = 'traffic road sign';
    }

    const encodedQuery = encodeURIComponent(query.trim());
    let path = `/v1/search?query=${encodedQuery}&per_page=${Math.min(perPage, 50)}&page=${page}`;
    if (orientation) {
      path += `&orientation=${orientation}`;
    }

    const result = await this.pexelsHttp(path);
    const photos: PexelsPhoto[] = (result.photos || []).map((p: any) => ({
      id: p.id,
      alt: p.alt || 'Traffic Photo',
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      url: p.url,
      dimensions: { width: p.width, height: p.height },
      urls: {
        original: p.src.original,
        large2x: p.src.large2x,
        large: p.src.large,
        medium: p.src.medium,
        small: p.src.small,
        thumbnail: p.src.tiny,
      },
    }));

    return {
      totalResults: result.total_results || 0,
      page: result.page || page,
      perPage: result.per_page || perPage,
      photos,
    };
  }

  /**
   * Get curated traffic themes for instant browsing in Admin CMS.
   */
  getCuratedThemes() {
    return [
      {
        id: 'regulatory',
        label: 'Regulatory Signs',
        badge: '🛑 Regulatory',
        query: 'stop sign yield speed limit road sign',
      },
      {
        id: 'warning',
        label: 'Warning & Caution',
        badge: '⚠️ Warning',
        query: 'yellow diamond warning road sign caution hazard',
      },
      {
        id: 'signals',
        label: 'Traffic Signals',
        badge: '🚦 Signals',
        query: 'traffic light red amber green intersection signals',
      },
      {
        id: 'weather',
        label: 'Adverse Weather',
        badge: '🌧️ Weather',
        query: 'rain wet road car driving slippery fog night highway',
      },
      {
        id: 'motorway',
        label: 'Highways & Motorways',
        badge: '🛣️ Motorway',
        query: 'highway road motorway traffic cars overhead gantry sign',
      },
      {
        id: 'pedestrian',
        label: 'Pedestrian & Urban',
        badge: '🚶 Pedestrian',
        query: 'pedestrian crossing crosswalk zebra crossing road street',
      },
    ];
  }

  /**
   * Upload or stream Pexels photo into Cloudinary CDN.
   * Gracefully falls back to high-res Pexels CDN URL if Cloudinary is misconfigured.
   */
  async syncToCloudinary(photoUrl: string, folder = 'roadwise/questions', publicId?: string) {
    try {
      const cloudinaryModule = await import('cloudinary');
      const uploadOptions: any = {
        folder,
        resource_type: 'image',
      };
      if (publicId) uploadOptions.public_id = publicId;

      const result = await cloudinaryModule.v2.uploader.upload(photoUrl, uploadOptions);
      return {
        success: true,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
      };
    } catch (err: any) {
      this.logger.warn(`Cloudinary upload warning: ${err.message}. Serving Pexels CDN directly.`);
      return {
        success: false,
        secureUrl: photoUrl,
        publicId: null,
        note: `Direct Pexels CDN fallback: ${err.message}`,
      };
    }
  }

  /**
   * Attach an image URL to a question in PostgreSQL.
   */
  async attachToQuestion(
    questionId: string,
    imageUrl: string,
    adminId: string,
    photographer?: string,
  ) {
    const existing = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) {
      throw new NotFoundException(`Question '${questionId}' not found`);
    }

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: { imageUrl },
    });

    await this.prisma.auditLog
      .create({
        data: {
          adminId,
          action: 'ATTACH_MEDIA_QUESTION',
          entityType: 'QUESTION',
          entityId: questionId,
          newValue: JSON.stringify({ imageUrl, photographer }),
        },
      })
      .catch((e) => this.logger.error(`Audit log error: ${e.message}`));

    return updated;
  }

  /**
   * Attach an image URL to a traffic sign variant in PostgreSQL.
   */
  async attachToSignVariant(variantId: string, imageUrl: string, adminId: string) {
    const existing = await this.prisma.trafficSignVariant.findUnique({ where: { id: variantId } });
    if (!existing) {
      throw new NotFoundException(`Sign variant '${variantId}' not found`);
    }

    const updated = await this.prisma.trafficSignVariant.update({
      where: { id: variantId },
      data: { imageUrl },
    });

    await this.prisma.auditLog
      .create({
        data: {
          adminId,
          action: 'ATTACH_MEDIA_SIGN_VARIANT',
          entityType: 'SIGN',
          entityId: variantId,
          newValue: JSON.stringify({ imageUrl }),
        },
      })
      .catch((e) => this.logger.error(`Audit log error: ${e.message}`));

    return updated;
  }

  // Private HTTP helper
  private pexelsHttp(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: 'api.pexels.com',
        path,
        method: 'GET',
        headers: {
          Authorization: this.pexelsApiKey,
          'User-Agent': 'TrafficTest-AdminMedia/1.0',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse Pexels response: ${data}`));
            }
          } else {
            reject(new Error(`Pexels API error (${res.statusCode}): ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }
}
