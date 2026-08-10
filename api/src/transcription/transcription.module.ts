import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscriptionController } from './transcription.controller';
import { TranscriptionService } from './transcription.service';
import { Transcription } from './transcription.entity';
import { ReviewModule } from '../review/review.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transcription]), ReviewModule, AiModule, AuthModule, ProjectsModule],
  controllers: [TranscriptionController],
  providers: [TranscriptionService],
})
export class TranscriptionModule {}
