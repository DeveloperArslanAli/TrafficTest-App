import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminCountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.country.findMany({
      include: {
        jurisdictions: {
          include: {
            _count: { select: { questions: true } },
          },
        },
        authorities: true,
        _count: { select: { questions: true, signVariants: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      include: {
        jurisdictions: { include: { authorities: true } },
        authorities: true,
        sources: true,
        examProfiles: true,
      },
    });
    if (!country) throw new NotFoundException(`Country '${id}' not found`);
    return country;
  }

  async createCountry(dto: { code: string; name: string; isoCode?: string; flagEmoji?: string }) {
    const existing = await this.prisma.country.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new BadRequestException(`Country code '${dto.code}' already exists`);

    return this.prisma.country.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        isoCode: dto.isoCode || dto.code,
        flagEmoji: dto.flagEmoji,
        status: 'ACTIVE',
      },
    });
  }

  async createJurisdiction(dto: { countryId: string; code: string; name: string; type?: any }) {
    return this.prisma.jurisdiction.create({
      data: {
        countryId: dto.countryId,
        code: dto.code.toUpperCase(),
        name: dto.name,
        type: dto.type || 'STATE',
        status: 'ACTIVE',
      },
    });
  }

  async createAuthority(dto: { countryId: string; jurisdictionId?: string; code: string; name: string; website?: string }) {
    return this.prisma.trafficAuthority.create({
      data: {
        countryId: dto.countryId,
        jurisdictionId: dto.jurisdictionId,
        code: dto.code.toUpperCase(),
        name: dto.name,
        website: dto.website,
        status: 'ACTIVE',
      },
    });
  }
}
