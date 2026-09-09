import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminCountriesService } from '../services/admin-countries.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/countries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCountriesController {
  constructor(private readonly countriesService: AdminCountriesService) {}

  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(id);
  }

  @Post()
  createCountry(@Body() dto: { code: string; name: string; isoCode?: string; flagEmoji?: string }) {
    return this.countriesService.createCountry(dto);
  }

  @Post(':id/jurisdictions')
  createJurisdiction(
    @Param('id') countryId: string,
    @Body() dto: { code: string; name: string; type?: any },
  ) {
    return this.countriesService.createJurisdiction({ ...dto, countryId });
  }

  @Post(':id/authorities')
  createAuthority(
    @Param('id') countryId: string,
    @Body() dto: { jurisdictionId?: string; code: string; name: string; website?: string },
  ) {
    return this.countriesService.createAuthority({ ...dto, countryId });
  }
}
