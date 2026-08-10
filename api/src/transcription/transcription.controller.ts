import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException, Body, Logger, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptionService } from './transcription.service';
import { diskStorage } from 'multer';
import * as os from 'os';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('transcription')
export class TranscriptionController {
  private readonly logger = new Logger(TranscriptionController.name);

  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @UseInterceptors(FileInterceptor('video', {
    storage: diskStorage({
      destination: os.tmpdir(),
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  }))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File, 
    @Body('technology') technology: string,
    @Body('projectId') projectId: string
  ) {
    this.logger.log(`Received upload request. Filename: ${file?.originalname || 'undefined'}, Technology: ${technology || 'None'}, Project: ${projectId}`);
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    const result = await this.transcriptionService.processVideo(file, technology, projectId);
    this.logger.log(`Completed processing upload request. Transcription ID: ${result.id}`);
    return result;
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  async findByProject(@Param('projectId') projectId: string) {
    return this.transcriptionService.findByProject(projectId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    return this.transcriptionService.findById(id);
  }

  @Get(':id/raw')
  @UseGuards(JwtAuthGuard)
  async getRawTranscript(@Param('id') id: string) {
    return this.transcriptionService.getRawTranscript(id);
  }
}
