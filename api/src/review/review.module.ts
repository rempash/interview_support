import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
