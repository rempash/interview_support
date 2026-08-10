import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcription } from '../transcription/transcription.entity';
import { AiService } from '../ai/ai.service';
import Redis from 'ioredis';

@Injectable()
export class QuestionsService {
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    @InjectRepository(Transcription)
    private transcriptionRepository: Repository<Transcription>,
    private readonly aiService: AiService,
  ) {}

  async syncQuestions(projectId: string, technology: string): Promise<{ count: number }> {
    const transcriptions = await this.transcriptionRepository.find({
      where: { project: { id: projectId }, technology },
      select: { review: true }
    });

    const allQuestions = new Set<string>();

    transcriptions.forEach(t => {
      if (t.review && Array.isArray(t.review.practiceQuestions)) {
        t.review.practiceQuestions.forEach((q: string) => allQuestions.add(q));
      }
    });

    const uniqueQuestions = Array.from(allQuestions);
    const key = `questions:${projectId}:${technology}`;
    
    // Overwrite the previous questions in Redis completely
    await this.redis.set(key, JSON.stringify(uniqueQuestions));
    this.logger.log(`Synced ${uniqueQuestions.length} questions to Redis for key ${key}`);

    return { count: uniqueQuestions.length };
  }

  async getQuestions(projectId: string, technology: string): Promise<string[]> {
    const key = `questions:${projectId}:${technology}`;
    const data = await this.redis.get(key);
    if (!data) return [];
    return JSON.parse(data);
  }

  async evaluateAnswer(technology: string, question: string, answer: string): Promise<{ feedback: string }> {
    const prompt = `You are a strict, highly experienced Senior Software Engineer conducting a technical interview for a role requiring deep expertise in ${technology}.
The candidate was asked the following technical question:
"${question}"

The candidate provided the following answer:
"${answer}"

Evaluate their answer critically. Do not sugarcoat. If the answer is completely wrong, factually incorrect, or shows a lack of understanding, explicitly state that it is a poor or incorrect answer and explain why. If they missed critical nuances, point them out. If they got it right, acknowledge it but remain professional. Keep the feedback highly actionable and under 4 sentences.`;

    try {
      const response = await this.aiService.generateContent([{ role: 'user', parts: [{ text: prompt }] }]);
      return { feedback: response.text || 'Good answer.' };
    } catch (error) {
      this.logger.error('Failed to evaluate answer', error);
      return { feedback: 'Unable to evaluate answer at this time.' };
    }
  }
}
