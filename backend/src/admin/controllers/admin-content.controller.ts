import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminContentService, BatchItemDto } from '../services/admin-content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminContentController {
  constructor(private readonly contentService: AdminContentService) {}

  @Post('validate')
  validateBatch(@Body('items') items: BatchItemDto[]) {
    return this.contentService.validateBatch(items || []);
  }

  @Post('import')
  importBatch(@Body('items') items: BatchItemDto[], @CurrentUser('id') adminId: string) {
    return this.contentService.importBatch(items || [], adminId);
  }

  @Post('publish')
  bulkPublish(@Body('ids') ids: string[], @CurrentUser('id') adminId: string) {
    return this.contentService.bulkPublish(ids || [], adminId);
  }
}
