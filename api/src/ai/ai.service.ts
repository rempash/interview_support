import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;
  
  // Using gemini-2.5-flash as the standard, but you can change this if needed.
  private readonly modelName = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async uploadFile(filePath: string) {
    this.logger.log(`Uploading file to Gemini: ${filePath}`);
    return this.ai.files.upload({ file: filePath });
  }

  async deleteFile(fileName: string) {
    this.logger.log(`Deleting file from Gemini: ${fileName}`);
    return this.ai.files.delete({ name: fileName });
  }

  async generateContent(contents: any, config?: any) {
    this.logger.log(`Calling Gemini generateContent using model ${this.modelName}...`);
    return this.ai.models.generateContent({
      model: this.modelName,
      contents,
      config,
    });
  }
}
