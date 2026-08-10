import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcription } from './transcription.entity';
import { ReviewService } from '../review/review.service';
import { AiService } from '../ai/ai.service';
import { ProjectsService } from '../projects/projects.service';
import ffmpeg = require('fluent-ffmpeg');
import ffmpegStatic = require('ffmpeg-static');
import * as fs from 'fs';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);
}

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  constructor(
    @InjectRepository(Transcription)
    private transcriptionRepository: Repository<Transcription>,
    private reviewService: ReviewService,
    private aiService: AiService,
    private projectsService: ProjectsService,
  ) {}

  async processVideo(
    file: Express.Multer.File,
    technology: string,
    projectId: string,
  ): Promise<Transcription> {
    const inputPath = file.path;
    const outputPath = `${inputPath}.mp3`;

    try {
      const projects = await this.projectsService.findAll();
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const totalStartTime = Date.now();
      this.logger.log(
        `Starting to process video ${file.originalname} for project ${project.name}...`,
      );

      const audioStartTime = Date.now();
      this.logger.log(`Extracting audio from ${inputPath}`);
      await this.extractAudio(inputPath, outputPath);
      this.logger.log(
        `Audio extracted successfully in ${Date.now() - audioStartTime}ms`,
      );

      const uploadStartTime = Date.now();
      const uploadResult = await this.aiService.uploadFile(outputPath);
      this.logger.log(
        `Upload to Gemini complete in ${Date.now() - uploadStartTime}ms. URI: ${uploadResult.uri}`,
      );

      const transcribeStartTime = Date.now();
      const response = await this.aiService.generateContent([
        {
          role: 'user',
          parts: [
            {
              fileData: {
                fileUri: uploadResult.uri,
                mimeType: uploadResult.mimeType,
              },
            },
            { text: 'Please transcribe this audio exactly as spoken.' },
          ],
        },
      ]);

      this.logger.log(
        `Transcription received in ${Date.now() - transcribeStartTime}ms. Transcript length: ${response.text?.length || 0} characters.`,
      );
      const transcriptText = response.text || 'No transcription available.';

      let review = null;
      if (technology) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        review = await this.reviewService.generateReview(
          transcriptText,
          technology,
        );
      }

      this.logger.log(`Saving transcription to database...`);
      const transcription = this.transcriptionRepository.create({
        originalFilename: file.originalname,
        transcript: transcriptText,
        technology: technology || 'General',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        review: review,
        project: project,
      });

      const saved = await this.transcriptionRepository.save(transcription);
      this.logger.log(
        `Video processing entirely completed in ${Date.now() - totalStartTime}ms.`,
      );

      // Clean up files in Gemini
      try {
        await this.aiService.deleteFile(uploadResult.name as unknown as string);
      } catch (e) {
        this.logger.error('Failed to delete file from Gemini', e);
      }

      // Exclude raw transcript from the response
      return saved;
    } finally {
      // Clean up local files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  }

  private extractAudio(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .save(outputPath)
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err));
    });
  }

  async findByProject(projectId: string): Promise<Transcription[]> {
    return this.transcriptionRepository.find({
      where: { project: { id: projectId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Transcription> {
    const transcription = await this.transcriptionRepository.findOne({
      where: { id },
    });
    if (!transcription) {
      throw new Error('Transcription not found');
    }
    return transcription;
  }

  async getRawTranscript(id: string): Promise<{ transcript: string }> {
    const transcription = await this.transcriptionRepository.findOne({
      where: { id },
      select: { id: true, transcript: true },
    });
    if (!transcription) {
      throw new Error('Transcription not found');
    }
    return { transcript: transcription.transcript };
  }
}
