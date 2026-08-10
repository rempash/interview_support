import { Api } from '../core/Api';

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

class ProjectsApi extends Api {
  async findAll(): Promise<Project[]> {
    const response = await this.get<Project[]>('/projects');
    return response.data;
  }

  async create(name: string): Promise<Project> {
    const response = await this.post<Project>('/projects', { name });
    return response.data;
  }

  async update(id: string, name: string): Promise<Project> {
    const response = await this.put<Project>(`/projects/${id}`, { name });
    return response.data;
  }

  async remove(id: string): Promise<void> {
    await this.delete(`/projects/${id}`);
  }
}

export const projectsApi = new ProjectsApi();
