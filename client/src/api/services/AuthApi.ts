import { Api } from '../core/Api';

export interface LoginResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
  };
}

class AuthApi extends Api {
  async login(credentials: Record<string, string>): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }
}

export const authApi = new AuthApi();
