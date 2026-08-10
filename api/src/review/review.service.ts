import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly aiService: AiService) {}

  async generateReview(transcript: string, technology: string): Promise<any> {
    this.logger.log(`Generating review for technology: ${technology}`);
    const startTime = Date.now();
    const prompt = `You are a Senior Software Engineer acting as an interviewer evaluating a candidate based on a transcribed software engineering interview. The focus technology for this interview is ${technology}.

Please analyze the following interview transcript and provide a structured review in JSON format matching exactly this schema:
{
  "good": ["point 1", "point 2"],
  "bad": ["point 1", "point 2"],
  "practiceQuestions": ["question 1", "question 2"]
}

Transcript:
${transcript}`;

    try {
      const response = await this.aiService.generateContent(
        [{ role: 'user', parts: [{ text: prompt }] }],
        { responseMimeType: 'application/json' }
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Successfully received structured review from Gemini in ${duration}ms`);

      if (response.text) {
         return JSON.parse(response.text);
      }
    } catch (e) {
      this.logger.error('Failed to generate or parse Gemini review JSON', e);
    }
    
    return { good: [], bad: [], practiceQuestions: [] };
  }
}
