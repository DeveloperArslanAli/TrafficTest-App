import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminSignsService, CreateSignDto, CreateSignVariantDto } from '../services/admin-signs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('admin/signs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSignsController {
  constructor(private readonly signsService: AdminSignsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.signsService.findAll({
      category,
      search,
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signsService.findOne(id);
  }

  @Get(':id/impact')
  getImpact(@Param('id') id: string) {
    return this.signsService.getImpact(id);
  }

  @Post()
  create(@Body() dto: CreateSignDto, @CurrentUser('id') adminId: string) {
    return this.signsService.create(dto, adminId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSignDto>,
    @CurrentUser('id') adminId: string,
  ) {
    return this.signsService.update(id, dto, adminId);
  }

  @Delete(':id')
  archive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.signsService.archive(id, adminId);
  }

  @Post(':id/variants')
  @UseInterceptors(FileInterceptor('image'))
  addVariant(
    @Param('id') signId: string,
    @Body() dto: CreateSignVariantDto,
    @CurrentUser('id') adminId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    dto.trafficSignId = signId;
    return this.signsService.addVariant(dto, adminId, file);
  }
}
