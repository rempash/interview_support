import { Api } from '../core/Api';

class QuestionsApi extends Api {
  async syncQuestions(projectId: string, technology: string): Promise<{ count: number }> {
    const response = await this.post(`/projects/${projectId}/technologies/${encodeURIComponent(technology)}/questions/sync`, {});
    return response.data;
  }

  async getQuestions(projectId: string, technology: string): Promise<string[]> {
    const response = await this.get(`/projects/${projectId}/technologies/${encodeURIComponent(technology)}/questions`);
    return response.data;
  }

  async evaluateAnswer(projectId: string, technology: string, question: string, answer: string): Promise<{ feedback: string }> {
    const response = await this.post(`/projects/${projectId}/technologies/${encodeURIComponent(technology)}/questions/evaluate`, {
      question,
      answer,
    });
    return response.data;
  }
}

export const questionsApi = new QuestionsApi();
