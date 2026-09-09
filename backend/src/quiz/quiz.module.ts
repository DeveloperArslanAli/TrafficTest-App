import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';

/**
 * QuizModule – serves public quiz data to the mobile client.
 * PrismaModule and RedisModule are @Global() so no explicit import needed.
 */
@Module({
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
