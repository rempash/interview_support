import { Api } from '../core/Api';

export interface User {
  id: string;
  username: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

class UsersApi extends Api {
  async findAll(): Promise<User[]> {
    const response = await this.get<User[]>('/users');
    return response.data;
  }

  async create(userData: any): Promise<User> {
    const response = await this.post<User>('/users', userData);
    return response.data;
  }

  async update({ id, ...updateData }: { id: string } & any): Promise<User> {
    const response = await this.put<User>(`/users/${id}`, updateData);
    return response.data;
  }

  async remove(id: string): Promise<void> {
    await this.delete(`/users/${id}`);
  }
}

export const usersApi = new UsersApi();
