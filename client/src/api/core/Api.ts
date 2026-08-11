import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export abstract class Api {
  protected readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    });

    // Request interceptor to automatically attach the Auth token
    this.http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle global errors (optional)
    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        // e.g., Handle 401 Unauthorized globally if desired
        return Promise.reject(error);
      }
    );
  }

  // Helper methods to abstract Axios if needed
  protected async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.get<T>(url, config);
  }

  protected async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.post<T>(url, data, config);
  }

  protected async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.put<T>(url, data, config);
  }

  protected async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.patch<T>(url, data, config);
  }

  protected async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.delete<T>(url, config);
  }
}
