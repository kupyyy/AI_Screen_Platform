import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理 Token 过期
request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshAccessToken();
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return request(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default request;

// 通用请求方法
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  request.get<any, T>(url, config);

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  request.post<any, T>(url, data, config);

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  request.put<any, T>(url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  request.delete<any, T>(url, config);
