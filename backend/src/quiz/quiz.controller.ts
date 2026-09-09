import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  /**
   * GET /quiz/version
   * Returns current content version for country or global scope.
   */
  @Get('version')
  async getVersion(
    @Query('country') country?: string,
    @Query('jurisdiction') jurisdiction?: string,
  ): Promise<{ version: number; country: string }> {
    const version = await this.quizService.getVersion(country, jurisdiction);
    return { version, country: country || 'GLOBAL' };
  }

  /**
   * GET /quiz/bank
   * Returns published questions filtered by country, jurisdiction, and category.
   * Supports delta synchronization via `sinceVersion`.
   */
  @Get('bank')
  getBank(
    @Query('country') country?: string,
    @Query('jurisdiction') jurisdiction?: string,
    @Query('category') category?: string,
    @Query('sinceVersion') sinceVersion?: string,
  ) {
    return this.quizService.getBank({
      country,
      jurisdiction,
      category,
      sinceVersion: sinceVersion ? Number(sinceVersion) : undefined,
    });
  }

  /**
   * GET /quiz/signs
   * Returns canonical signs and official variants.
   */
  @Get('signs')
  getSigns(
    @Query('country') country?: string,
    @Query('category') category?: string,
  ) {
    return this.quizService.getSigns(country, category);
  }

  /**
   * GET /quiz/signs/:code
   * Returns single sign by canonical code (e.g. REG-STOP).
   */
  @Get('signs/:code')
  getSignByCode(@Param('code') code: string) {
    return this.quizService.getSignByCode(code);
  }

  /**
   * GET /quiz/categories
   * Returns live dynamic counts per category (zero hardcoded values).
   */
  @Get('categories')
  getCategories(@Query('country') country?: string) {
    return this.quizService.getCategories(country);
  }

  /**
   * GET /quiz/exams
   * Returns exam configuration profiles.
   */
  @Get('exams')
  getExams(@Query('country') country?: string) {
    return this.quizService.getExams(country);
  }
}
