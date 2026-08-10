import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscriptionModule } from './transcription/transcription.module';
import { Transcription } from './transcription/transcription.entity';
import { ReviewModule } from './review/review.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { Project } from './projects/project.entity';
import { TechnologiesModule } from './technologies/technologies.module';
import { Technology } from './technologies/technology.entity';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5433/transcription_db',
      entities: [Transcription, User, Project, Technology],
      synchronize: false,
    }),
    TranscriptionModule,
    ReviewModule,
    AiModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    TechnologiesModule,
    QuestionsModule,
  ],
})
export class AppModule {}
