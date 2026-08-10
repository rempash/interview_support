import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';
import { Technology } from './technology.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Technology]), AuthModule],
  controllers: [TechnologiesController],
  providers: [TechnologiesService],
})
export class TechnologiesModule {}
