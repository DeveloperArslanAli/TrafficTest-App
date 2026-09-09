import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminDuplicatesService } from '../services/admin-duplicates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, DuplicateStatus } from '@prisma/client';

@Controller('admin/duplicates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDuplicatesController {
  constructor(private readonly duplicatesService: AdminDuplicatesService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('type') type?: string) {
    return this.duplicatesService.findAll(status, type);
  }

  @Get(':id')
  getDetails(@Param('id') id: string) {
    return this.duplicatesService.getDetails(id);
  }

  @Post(':id/merge')
  merge(
    @Param('id') id: string,
    @Body('targetId') targetId: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.duplicatesService.merge(id, targetId, reason, adminId);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body('status') status: DuplicateStatus,
    @Body('reason') reason: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.duplicatesService.resolve(id, status, reason, adminId);
  }

  @Post('scan')
  scan() {
    return this.duplicatesService.scanForDuplicates();
  }
}
