import { Api } from '../core/Api';

export interface Technology {
  id: string;
  name: string;
  createdAt: string;
}

class TechnologiesApi extends Api {
  async findAll(): Promise<Technology[]> {
    const response = await this.get('/technologies');
    return response.data;
  }

  async create(data: { name: string }): Promise<Technology> {
    const response = await this.post('/technologies', data);
    return response.data;
  }

  async update(id: string, data: { name: string }): Promise<Technology> {
    const response = await this.patch(`/technologies/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<void> {
    await this.delete(`/technologies/${id}`);
  }
}

export const technologiesApi = new TechnologiesApi();
