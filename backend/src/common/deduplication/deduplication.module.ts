import { Module, Global } from '@nestjs/common';
import { DeduplicationService } from './deduplication.service';

@Global()
@Module({
  providers: [DeduplicationService],
  exports: [DeduplicationService],
})
export class DeduplicationModule {}
