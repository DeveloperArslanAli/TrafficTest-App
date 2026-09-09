import { Module } from '@nestjs/common';
import { AdminQuestionsService } from './questions.service';
import { AdminQuestionsController } from './questions.controller';

import { AdminSignsService } from './services/admin-signs.service';
import { AdminSignsController } from './controllers/admin-signs.controller';

import { AdminDuplicatesService } from './services/admin-duplicates.service';
import { AdminDuplicatesController } from './controllers/admin-duplicates.controller';

import { AdminSourcesService } from './services/admin-sources.service';
import { AdminSourcesController } from './controllers/admin-sources.controller';

import { AdminCountriesService } from './services/admin-countries.service';
import { AdminCountriesController } from './controllers/admin-countries.controller';

import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';

import { AdminContentService } from './services/admin-content.service';
import { AdminContentController } from './controllers/admin-content.controller';

import { AdminMediaService } from './services/admin-media.service';
import { AdminMediaController } from './controllers/admin-media.controller';

@Module({
  controllers: [
    AdminQuestionsController,
    AdminSignsController,
    AdminDuplicatesController,
    AdminSourcesController,
    AdminCountriesController,
    AdminAnalyticsController,
    AdminContentController,
    AdminMediaController,
  ],
  providers: [
    AdminQuestionsService,
    AdminSignsService,
    AdminDuplicatesService,
    AdminSourcesService,
    AdminCountriesService,
    AdminAnalyticsService,
    AdminContentService,
    AdminMediaService,
  ],
})
export class AdminModule {}
