import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeduplicationService } from '../../common/deduplication/deduplication.service';
import { DuplicateStatus, DuplicateType, ContentStatus } from '@prisma/client';

@Injectable()
export class AdminDuplicatesService {
  private readonly logger = new Logger(AdminDuplicatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deduplication: DeduplicationService,
  ) {}

  async findAll(status?: string, type?: string) {
    const where: any = {};
    if (status) where.status = status as DuplicateStatus;
    if (type) where.candidateType = type as DuplicateType;

    return this.prisma.duplicateCandidate.findMany({
      where,
      orderBy: { similarityScore: 'desc' },
      take: 100,
    });
  }

  async getDetails(id: string) {
    const candidate = await this.prisma.duplicateCandidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException(`Candidate '${id}' not found`);

    if (candidate.candidateType === DuplicateType.SIGN) {
      const [signA, signB] = await Promise.all([
        this.prisma.trafficSign.findUnique({ where: { id: candidate.entityAId }, include: { variants: true } }),
        this.prisma.trafficSign.findUnique({ where: { id: candidate.entityBId }, include: { variants: true } }),
      ]);
      return { candidate, entityA: signA, entityB: signB };
    } else {
      const [qA, qB] = await Promise.all([
        this.prisma.question.findUnique({ where: { id: candidate.entityAId } }),
        this.prisma.question.findUnique({ where: { id: candidate.entityBId } }),
      ]);
      return { candidate, entityA: qA, entityB: qB };
    }
  }

  /**
   * Transactionally merge duplicate entity into target canonical entity.
   */
  async merge(id: string, targetId: string, reason: string, adminId: string) {
    const candidate = await this.prisma.duplicateCandidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException(`Candidate '${id}' not found`);

    const sourceId = candidate.entityAId === targetId ? candidate.entityBId : candidate.entityAId;

    if (candidate.candidateType === DuplicateType.SIGN) {
      await this.prisma.$transaction(async (tx) => {
        // 1. Repoint all questions referencing sourceId to targetId
        await tx.question.updateMany({
          where: { signId: sourceId },
          data: { signId: targetId },
        });

        // 2. Repoint all variants
        await tx.trafficSignVariant.updateMany({
          where: { trafficSignId: sourceId },
          data: { trafficSignId: targetId },
        });

        // 3. Mark source sign as ARCHIVED
        await tx.trafficSign.update({
          where: { id: sourceId },
          data: { status: ContentStatus.ARCHIVED },
        });

        // 4. Update candidate status
        await tx.duplicateCandidate.update({
          where: { id },
          data: {
            status: DuplicateStatus.MERGED,
            resolvedBy: adminId,
            resolutionReason: reason || 'Merged by admin',
            resolvedAt: new Date(),
          },
        });

        // 5. Audit log
        await tx.auditLog.create({
          data: {
            adminId,
            action: 'MERGE_SIGN',
            entityType: 'SIGN',
            entityId: targetId,
            oldValue: JSON.stringify({ mergedSourceId: sourceId }),
            newValue: JSON.stringify({ targetId }),
            reason,
          },
        });
      });

      return { message: `Successfully merged sign '${sourceId}' into '${targetId}'` };
    } else {
      // Question merge
      await this.prisma.$transaction(async (tx) => {
        // Archive duplicate question
        await tx.question.update({
          where: { id: sourceId },
          data: {
            isPublished: false,
            status: ContentStatus.ARCHIVED,
          },
        });

        await tx.duplicateCandidate.update({
          where: { id },
          data: {
            status: DuplicateStatus.MERGED,
            resolvedBy: adminId,
            resolutionReason: reason || 'Duplicate question merged/archived',
            resolvedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            adminId,
            action: 'MERGE_QUESTION',
            entityType: 'QUESTION',
            entityId: targetId,
            oldValue: JSON.stringify({ mergedQuestionId: sourceId }),
            reason,
          },
        });
      });

      return { message: `Successfully merged question '${sourceId}' into '${targetId}'` };
    }
  }

  /**
   * Resolve without merge: KEPT_SEPARATE, MARKED_AS_VARIANT, or REJECTED.
   */
  async resolve(id: string, status: DuplicateStatus, reason: string, adminId: string) {
    const candidate = await this.prisma.duplicateCandidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException(`Candidate '${id}' not found`);

    const updated = await this.prisma.duplicateCandidate.update({
      where: { id },
      data: {
        status,
        resolutionReason: reason,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Run automated deduplication scan across all active signs.
   */
  async scanForDuplicates() {
    const signs = await this.prisma.trafficSign.findMany({
      where: { status: ContentStatus.PUBLISHED },
    });

    let detectedCount = 0;

    for (let i = 0; i < signs.length; i++) {
      for (let j = i + 1; j < signs.length; j++) {
        const sA = signs[i];
        const sB = signs[j];

        const cmp = this.deduplication.compareSigns(
          { name: sA.canonicalName, meaning: sA.meaning, symbol: sA.primarySymbol },
          { name: sB.canonicalName, meaning: sB.meaning, symbol: sB.primarySymbol },
        );

        if (cmp.similarityScore >= 0.75) {
          // Check if already in candidate table
          const existing = await this.prisma.duplicateCandidate.findFirst({
            where: {
              OR: [
                { entityAId: sA.id, entityBId: sB.id },
                { entityAId: sB.id, entityBId: sA.id },
              ],
            },
          });

          if (!existing) {
            await this.prisma.duplicateCandidate.create({
              data: {
                candidateType: DuplicateType.SIGN,
                entityAId: sA.id,
                entityBId: sB.id,
                similarityScore: cmp.similarityScore,
                nameScore: cmp.nameScore,
                meaningScore: cmp.meaningScore,
                symbolScore: cmp.symbolScore,
                imageScore: cmp.imageScore,
                recommendation: cmp.recommendation as any,
                status: DuplicateStatus.PENDING,
              },
            });
            detectedCount++;
          }
        }
      }
    }

    return { message: `Scan complete. Found ${detectedCount} new duplicate candidate pairs.` };
  }
}
