import { PrismaClient, Role, ContentStatus, DifficultyLevel, VersionScope, MigrationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import Redis from 'ioredis';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  retryStrategy: () => null, // Non-blocking if redis isn't running
});

function computeFingerprints(text: string, category: string, signCode?: string, type?: string) {
  const stopWords = new Set(['what', 'does', 'this', 'sign', 'mean', 'indicate', 'a', 'an', 'the', 'is', 'of', 'when', 'you', 'see', 'to', 'in', 'on', 'at', 'for', 'by', 'do', 'should', 'driver']);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t && !stopWords.has(t));
  
  const normText = tokens.sort().join(' ');
  const questionFingerprint = crypto.createHash('sha256').update(normText).digest('hex').slice(0, 24);
  const semanticBase = `${category}:${signCode || 'NONE'}:${type || 'GEN'}:${normText}`;
  const semanticFingerprint = crypto.createHash('sha256').update(semanticBase).digest('hex').slice(0, 24);

  return { questionFingerprint, semanticFingerprint };
}

async function main() {
  console.log('🚀 Starting Global Traffic Knowledge Platform Database Seeding...');

  // 1. Archival of Legacy Questions (Preserve data integrity, zero destructive loss)
  const legacyQuestions = await prisma.question.findMany({
    where: { isLegacy: false, questionCode: null }
  });

  if (legacyQuestions.length > 0) {
    console.log(`📦 Archiving ${legacyQuestions.length} existing legacy questions into LegacyQuestion...`);
    for (const lq of legacyQuestions) {
      await prisma.legacyQuestion.upsert({
        where: { legacyId: lq.id },
        update: {},
        create: {
          legacyId: lq.id,
          originalText: lq.text,
          originalCategory: lq.category,
          originalSignCode: lq.signCode,
          originalData: {
            text: lq.text,
            category: lq.category,
            options: lq.options,
            correctIndex: lq.correctIndex,
            explanation: lq.explanation,
            imageUrl: lq.imageUrl,
            signCode: lq.signCode
          },
          migrationStatus: MigrationStatus.ARCHIVED,
          migrationReason: 'Migrated to Global Traffic Knowledge Platform'
        }
      });
    }

    // Mark them as legacy and unpublish from active consumer quiz queries
    await prisma.question.updateMany({
      where: { id: { in: legacyQuestions.map(q => q.id) } },
      data: {
        isLegacy: true,
        isPublished: false,
        status: ContentStatus.ARCHIVED
      }
    });
    console.log('✅ All legacy questions archived and removed from active search & quiz paths.');
  }

  // 2. Upsert AppSetting & ContentVersion
  const INITIAL_VERSION = 100;
  await prisma.appSetting.upsert({
    where: { id: 'single_row' },
    update: { questionBankVersion: INITIAL_VERSION },
    create: { id: 'single_row', questionBankVersion: INITIAL_VERSION },
  });

  await prisma.contentVersion.upsert({
    where: {
      scope_countryCode_jurisdictionCode: {
        scope: VersionScope.GLOBAL,
        countryCode: 'GLOBAL',
        jurisdictionCode: ''
      }
    },
    update: { version: INITIAL_VERSION },
    create: {
      scope: VersionScope.GLOBAL,
      countryCode: 'GLOBAL',
      jurisdictionCode: '',
      version: INITIAL_VERSION,
      metadata: { release: 'Global Traffic Knowledge v1.0.0' }
    }
  });

  try {
    await redis.connect();
    await redis.set('question_bank_version', String(INITIAL_VERSION));
    await redis.set('content_version:GLOBAL', String(INITIAL_VERSION));
    console.log(`✅ Redis version primed (version: ${INITIAL_VERSION})`);
  } catch (err: any) {
    console.warn('⚠️ Redis not available during seed (fallback DB will be used):', err.message);
  }

  // 3. Upsert Admin User
  const hashedPassword = await bcrypt.hash('Admin1234!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@roadwise.com' },
    update: {},
    create: {
      email: 'admin@roadwise.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user verified: ${admin.email}`);

  // 4. Seed Countries, Jurisdictions & Authorities
  const contentDir = path.resolve(__dirname, '../../shared/traffic-content');
  const authoritiesData: any[] = JSON.parse(
    fs.readFileSync(path.join(contentDir, 'sources/authorities.json'), 'utf-8')
  );

  const countryCodes = ['GLOBAL', 'PK', 'SA', 'AE', 'US', 'GB', 'CA', 'AU'];
  const countryMap: Record<string, any> = {};

  for (const cCode of countryCodes) {
    const countryObj = await prisma.country.upsert({
      where: { code: cCode },
      update: {},
      create: {
        code: cCode,
        name: cCode === 'GLOBAL' ? 'Global Core' :
              cCode === 'PK' ? 'Pakistan' :
              cCode === 'SA' ? 'Saudi Arabia' :
              cCode === 'AE' ? 'United Arab Emirates' :
              cCode === 'US' ? 'United States' :
              cCode === 'GB' ? 'United Kingdom' :
              cCode === 'CA' ? 'Canada' : 'Australia',
        isoCode: cCode,
        flagEmoji: cCode === 'GLOBAL' ? '🌐' :
                   cCode === 'PK' ? '🇵🇰' :
                   cCode === 'SA' ? '🇸🇦' :
                   cCode === 'AE' ? '🇦🇪' :
                   cCode === 'US' ? '🇺🇸' :
                   cCode === 'GB' ? '🇬🇧' :
                   cCode === 'CA' ? '🇨🇦' : '🇦🇺',
        status: 'ACTIVE'
      }
    });
    countryMap[cCode] = countryObj;
  }
  console.log(`✅ Seeded ${Object.keys(countryMap).length} Countries`);

  // Seed Jurisdictions from country packs
  const jurisdictionMap: Record<string, any> = {};
  const countryPackFiles = fs.readdirSync(path.join(contentDir, 'countries'));
  for (const file of countryPackFiles) {
    if (!file.endsWith('.json')) continue;
    const pack = JSON.parse(fs.readFileSync(path.join(contentDir, 'countries', file), 'utf-8'));
    const country = countryMap[pack.code];
    if (country && pack.jurisdictions) {
      for (const j of pack.jurisdictions) {
        const juris = await prisma.jurisdiction.upsert({
          where: {
            countryId_code: {
              countryId: country.id,
              code: j.code
            }
          },
          update: { name: j.name, type: j.type },
          create: {
            countryId: country.id,
            code: j.code,
            name: j.name,
            type: j.type,
            status: 'ACTIVE'
          }
        });
        jurisdictionMap[`${pack.code}:${j.code}`] = juris;
      }
    }
  }
  console.log(`✅ Seeded ${Object.keys(jurisdictionMap).length} Jurisdictions`);

  // Seed Authorities and Sources
  const sourceMap: Record<string, any> = {};
  for (const auth of authoritiesData) {
    const country = countryMap[auth.countryCode] || countryMap['GLOBAL'];
    const jurisdiction = auth.jurisdictionCode ? jurisdictionMap[`${auth.countryCode}:${auth.jurisdictionCode}`] : null;

    const dbAuth = await prisma.trafficAuthority.upsert({
      where: { id: auth.code },
      update: { name: auth.name, website: auth.website },
      create: {
        id: auth.code,
        code: auth.code,
        countryId: country.id,
        jurisdictionId: jurisdiction?.id || null,
        name: auth.name,
        website: auth.website,
        status: 'ACTIVE'
      }
    });

    for (const src of auth.sources) {
      const dbSrc = await prisma.source.upsert({
        where: { id: src.code },
        update: { name: src.name, url: src.url, document: src.document, section: src.section, page: src.page },
        create: {
          id: src.code,
          name: src.name,
          url: src.url,
          document: src.document,
          section: src.section,
          page: src.page,
          tier: auth.tier || 1,
          authorityId: dbAuth.id,
          countryId: country.id,
          jurisdictionId: jurisdiction?.id || null,
          status: 'VERIFIED',
          verifiedAt: new Date()
        }
      });
      sourceMap[src.code] = dbSrc;
    }
  }
  console.log(`✅ Seeded Authorities and ${Object.keys(sourceMap).length} Tier-1 Sources`);

  // Default global source fallback
  const viennaSource = sourceMap['SRC-VIENNA-CONVENTION'] || Object.values(sourceMap)[0];

  // 5. Seed Canonical Signs & Variants
  const signFiles = ['regulatory.json', 'warning.json', 'signals.json'];
  const signMap: Record<string, any> = {};
  let totalSignsSeeded = 0;
  let totalQuestionsSeeded = 0;

  for (const sf of signFiles) {
    const signDefs: any[] = JSON.parse(fs.readFileSync(path.join(contentDir, 'global', sf), 'utf-8'));
    for (const s of signDefs) {
      const dbSign = await prisma.trafficSign.upsert({
        where: { canonicalCode: s.canonicalCode },
        update: {
          canonicalName: s.canonicalName,
          shortName: s.shortName,
          meaning: s.meaning,
          driverAction: s.driverAction,
          shape: s.shape,
          primarySymbol: s.primarySymbol,
          category: s.category
        },
        create: {
          canonicalCode: s.canonicalCode,
          category: s.category,
          subCategory: s.subCategory,
          canonicalName: s.canonicalName,
          shortName: s.shortName,
          meaning: s.meaning,
          driverAction: s.driverAction,
          shape: s.shape,
          primarySymbol: s.primarySymbol,
          prohibitionType: s.prohibitionType,
          isGlobal: true,
          status: ContentStatus.PUBLISHED
        }
      });
      signMap[s.canonicalCode] = dbSign;
      totalSignsSeeded++;

      // Seed Variants
      if (s.variants && s.variants.length > 0) {
        for (const v of s.variants) {
          const vCountry = countryMap[v.countryCode] || countryMap['GLOBAL'];
          const vSource = sourceMap[v.sourceCode] || viennaSource;
          const imageHash = crypto.createHash('md5').update(`${s.canonicalCode}:${v.officialCode}`).digest('hex');

          await prisma.trafficSignVariant.upsert({
            where: {
              trafficSignId_countryId_officialCode: {
                trafficSignId: dbSign.id,
                countryId: vCountry.id,
                officialCode: v.officialCode
              }
            },
            update: {
              officialName: v.officialName,
              meaning: v.meaning || s.meaning,
              driverAction: v.driverAction || s.driverAction,
              sourceId: vSource.id
            },
            create: {
              trafficSignId: dbSign.id,
              countryId: vCountry.id,
              officialCode: v.officialCode,
              officialName: v.officialName,
              meaning: v.meaning || s.meaning,
              driverAction: v.driverAction || s.driverAction,
              imageUrl: v.imageUrl || null,
              imageHash,
              shape: s.shape,
              sourceId: vSource.id,
              status: ContentStatus.PUBLISHED
            }
          });
        }
      }

      // Seed Questions bound to sign
      if (s.questions && s.questions.length > 0) {
        for (const q of s.questions) {
          const qSource = sourceMap[q.sourceCode] || viennaSource;
          const { questionFingerprint, semanticFingerprint } = computeFingerprints(
            q.text,
            s.category,
            s.canonicalCode,
            q.questionType
          );

          const dbQuestion = await prisma.question.upsert({
            where: { questionCode: q.questionCode },
            update: {
              text: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
              correctAnswer: q.options[q.correctIndex],
              explanation: q.explanation,
              category: s.category,
              signCode: s.canonicalCode,
              signId: dbSign.id,
              sourceId: qSource.id,
              questionFingerprint,
              semanticFingerprint,
              isPublished: true,
              status: ContentStatus.PUBLISHED,
              isLegacy: false
            },
            create: {
              questionCode: q.questionCode,
              category: s.category,
              subCategory: s.subCategory,
              questionType: q.questionType,
              difficulty: q.difficulty || DifficultyLevel.EASY,
              signId: dbSign.id,
              signCode: s.canonicalCode,
              sourceId: qSource.id,
              text: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
              correctAnswer: q.options[q.correctIndex],
              explanation: q.explanation,
              isPublished: true,
              status: ContentStatus.PUBLISHED,
              language: 'en',
              questionFingerprint,
              semanticFingerprint,
              isLegacy: false
            }
          });

          // Seed QuestionOption relation rows
          for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
            await prisma.questionOption.create({
              data: {
                questionId: dbQuestion.id,
                optionText: q.options[optIdx],
                isCorrect: optIdx === q.correctIndex,
                sortOrder: optIdx
              }
            });
          }

          // Link QuestionSource
          await prisma.questionSource.upsert({
            where: {
              questionId_sourceId: {
                questionId: dbQuestion.id,
                sourceId: qSource.id
              }
            },
            update: {},
            create: {
              questionId: dbQuestion.id,
              sourceId: qSource.id,
              citationText: `${qSource.name} (${qSource.document}, ${qSource.section})`
            }
          });

          totalQuestionsSeeded++;
        }
      }
    }
  }
  console.log(`✅ Seeded ${totalSignsSeeded} Canonical Signs and sign questions`);

  // 6. Seed General Knowledge Concepts & Questions
  const genDefs: any[] = JSON.parse(fs.readFileSync(path.join(contentDir, 'global/general.json'), 'utf-8'));
  for (const g of genDefs) {
    for (const q of g.questions) {
      const qSource = sourceMap[q.sourceCode] || viennaSource;
      const { questionFingerprint, semanticFingerprint } = computeFingerprints(
        q.text,
        'GENERAL_KNOWLEDGE',
        g.conceptCode,
        q.questionType
      );

      const dbQuestion = await prisma.question.upsert({
        where: { questionCode: q.questionCode },
        update: {
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.options[q.correctIndex],
          explanation: q.explanation,
          category: 'GENERAL_KNOWLEDGE',
          sourceId: qSource.id,
          questionFingerprint,
          semanticFingerprint,
          isPublished: true,
          status: ContentStatus.PUBLISHED,
          isLegacy: false
        },
        create: {
          questionCode: q.questionCode,
          category: 'GENERAL_KNOWLEDGE',
          subCategory: g.subCategory,
          questionType: q.questionType,
          difficulty: q.difficulty || DifficultyLevel.MEDIUM,
          sourceId: qSource.id,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.options[q.correctIndex],
          explanation: q.explanation,
          isPublished: true,
          status: ContentStatus.PUBLISHED,
          language: 'en',
          questionFingerprint,
          semanticFingerprint,
          isLegacy: false
        }
      });

      for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
        await prisma.questionOption.create({
          data: {
            questionId: dbQuestion.id,
            optionText: q.options[optIdx],
            isCorrect: optIdx === q.correctIndex,
            sortOrder: optIdx
          }
        });
      }

      await prisma.questionSource.upsert({
        where: {
          questionId_sourceId: {
            questionId: dbQuestion.id,
            sourceId: qSource.id
          }
        },
        update: {},
        create: {
          questionId: dbQuestion.id,
          sourceId: qSource.id,
          citationText: `${qSource.name} (${qSource.document})`
        }
      });

      totalQuestionsSeeded++;
    }
  }
  console.log(`✅ Seeded General Knowledge questions (Total active questions now: ${totalQuestionsSeeded})`);

  // 7. Seed Country-Specific Rules & Exam Profiles
  for (const file of countryPackFiles) {
    if (!file.endsWith('.json')) continue;
    const pack = JSON.parse(fs.readFileSync(path.join(contentDir, 'countries', file), 'utf-8'));
    const country = countryMap[pack.code];

    if (pack.rules && pack.rules.length > 0) {
      for (const rule of pack.rules) {
        const ruleSource = sourceMap[rule.sourceCode] || viennaSource;
        const { questionFingerprint, semanticFingerprint } = computeFingerprints(
          rule.text,
          'GENERAL_KNOWLEDGE',
          pack.code,
          'COUNTRY_RULE'
        );

        const dbQuestion = await prisma.question.upsert({
          where: { questionCode: rule.questionCode },
          update: {
            text: rule.text,
            options: rule.options,
            correctIndex: rule.correctIndex,
            correctAnswer: rule.options[rule.correctIndex],
            explanation: rule.explanation,
            countryId: country.id,
            sourceId: ruleSource.id,
            isPublished: true,
            status: ContentStatus.PUBLISHED,
            isLegacy: false
          },
          create: {
            questionCode: rule.questionCode,
            category: 'GENERAL_KNOWLEDGE',
            subCategory: 'COUNTRY_SPECIFIC_RULE',
            questionType: 'COUNTRY_RULE',
            difficulty: DifficultyLevel.MEDIUM,
            countryId: country.id,
            sourceId: ruleSource.id,
            text: rule.text,
            options: rule.options,
            correctIndex: rule.correctIndex,
            correctAnswer: rule.options[rule.correctIndex],
            explanation: rule.explanation,
            isPublished: true,
            status: ContentStatus.PUBLISHED,
            language: 'en',
            questionFingerprint,
            semanticFingerprint,
            isLegacy: false
          }
        });

        for (let optIdx = 0; optIdx < rule.options.length; optIdx++) {
          await prisma.questionOption.create({
            data: {
              questionId: dbQuestion.id,
              optionText: rule.options[optIdx],
              isCorrect: optIdx === rule.correctIndex,
              sortOrder: optIdx
            }
          });
        }

        totalQuestionsSeeded++;
      }
    }

    // Exam Profile
    await prisma.examProfile.upsert({
      where: { code: `EXAM-${pack.code}-STD` },
      update: {},
      create: {
        code: `EXAM-${pack.code}-STD`,
        countryId: country.id,
        name: `${pack.name} Standard Driving Theory Exam`,
        licenseCategory: 'CAR',
        questionCount: 20,
        passingScore: 80,
        timeLimitMinutes: 30,
        categoryDistribution: {
          TRAFFIC_REGULATORY: 6,
          WARNING_SIGNS: 5,
          TRAFFIC_SIGNALS: 3,
          GENERAL_KNOWLEDGE: 6
        },
        status: 'ACTIVE'
      }
    });

    // ContentVersion per country
    await prisma.contentVersion.upsert({
      where: {
        scope_countryCode_jurisdictionCode: {
          scope: VersionScope.COUNTRY,
          countryCode: pack.code,
          jurisdictionCode: ''
        }
      },
      update: { version: INITIAL_VERSION },
      create: {
        scope: VersionScope.COUNTRY,
        countryCode: pack.code,
        jurisdictionCode: '',
        version: INITIAL_VERSION,
        metadata: { country: pack.name }
      }
    });
  }

  console.log(`🎉 Complete Seeding Finished! Seeded ${totalSignsSeeded} signs and ${totalQuestionsSeeded} source-verified questions.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      redis.disconnect();
    } catch {}
    await prisma.$disconnect();
  });
