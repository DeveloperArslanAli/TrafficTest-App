import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminMediaService } from '../services/admin-media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

export interface AttachQuestionDto {
  questionId: string;
  imageUrl: string;
  photographer?: string;
}

export interface AttachSignDto {
  variantId: string;
  imageUrl: string;
}

export interface SyncCloudinaryDto {
  photoUrl: string;
  folder?: string;
  publicId?: string;
}

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminMediaController {
  constructor(private readonly mediaService: AdminMediaService) {}

  @Get('pexels/search')
  searchPexels(
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('orientation') orientation?: string,
  ) {
    return this.mediaService.searchPexels(
      query || 'traffic road sign',
      page ? Number(page) : 1,
      perPage ? Number(perPage) : 15,
      orientation,
    );
  }

  @Get('themes')
  getCuratedThemes() {
    return this.mediaService.getCuratedThemes();
  }

  @Post('sync-cloudinary')
  syncCloudinary(@Body() dto: SyncCloudinaryDto) {
    return this.mediaService.syncToCloudinary(dto.photoUrl, dto.folder, dto.publicId);
  }

  @Post('attach-question')
  attachToQuestion(@Body() dto: AttachQuestionDto, @CurrentUser('id') adminId: string) {
    return this.mediaService.attachToQuestion(
      dto.questionId,
      dto.imageUrl,
      adminId,
      dto.photographer,
    );
  }

  @Post('attach-sign')
  attachToSign(@Body() dto: AttachSignDto, @CurrentUser('id') adminId: string) {
    return this.mediaService.attachToSignVariant(dto.variantId, dto.imageUrl, adminId);
  }
}
