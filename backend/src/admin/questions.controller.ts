import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminQuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('admin/questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminQuestionsController {
  constructor(private readonly questionsService: AdminQuestionsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('countryId') countryId?: string,
    @Query('jurisdictionId') jurisdictionId?: string,
    @Query('status') status?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.questionsService.findAll({
      category,
      countryId,
      jurisdictionId,
      status,
      difficulty,
      search,
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateQuestionDto,
    @CurrentUser('id') adminId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.questionsService.create(dto, adminId, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('id') adminId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.questionsService.update(id, dto, adminId, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.questionsService.delete(id, adminId);
  }

  @Patch(':id/publish')
  togglePublish(
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
    @CurrentUser('id') adminId: string,
  ) {
    return this.questionsService.togglePublish(id, isPublished, adminId);
  }
}
