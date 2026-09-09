import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminSourcesService, CreateSourceDto } from '../services/admin-sources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('admin/sources')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSourcesController {
  constructor(private readonly sourcesService: AdminSourcesService) {}

  @Get()
  findAll() {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSourceDto, @CurrentUser('id') adminId: string) {
    return this.sourcesService.create(dto, adminId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSourceDto>,
    @Body('markRequiresReview') markRequiresReview: boolean,
    @CurrentUser('id') adminId: string,
  ) {
    return this.sourcesService.update(id, dto, markRequiresReview ?? false, adminId);
  }
}
