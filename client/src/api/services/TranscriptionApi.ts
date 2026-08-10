import { Api } from '../core/Api';

class TranscriptionApi extends Api {
  async uploadVideo(formData: FormData): Promise<any> {
    const response = await this.post('/transcription/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async findByProject(projectId: string): Promise<any[]> {
    const response = await this.get(`/transcription/project/${projectId}`);
    return response.data;
  }

  async findById(id: string): Promise<any> {
    const response = await this.get(`/transcription/${id}`);
    return response.data;
  }

  async getRawTranscript(id: string): Promise<any> {
    const response = await this.get(`/transcription/${id}/raw`);
    return response.data;
  }
}

export const transcriptionApi = new TranscriptionApi();
