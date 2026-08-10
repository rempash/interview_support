import { DataSource } from 'typeorm';
import { Transcription } from './transcription/transcription.entity';
import { User } from './users/user.entity';
import { Project } from './projects/project.entity';
import { Technology } from './technologies/technology.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5433/transcription_db',
  synchronize: false,
  logging: true,
  entities: [Transcription, User, Project, Technology],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
