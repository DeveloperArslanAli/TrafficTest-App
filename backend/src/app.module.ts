import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { QuizModule } from './quiz/quiz.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AppController } from './app.controller';
import { DeduplicationModule } from './common/deduplication/deduplication.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Rate limiting: 20 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // milliseconds (v5 API)
        limit: 20,
      },
    ]),

    // Core infrastructure
    PrismaModule,
    RedisModule,
    CloudinaryModule,

    // Feature modules
    AuthModule,
    AdminModule,
    QuizModule,
    DeduplicationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
