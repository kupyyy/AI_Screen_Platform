import { get, post, put } from './request';
import type { ApiResponse, User } from '@/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    post<ApiResponse<AuthResponse>>('/auth/register', data),

  refresh: (refreshToken: string) =>
    post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

  getMe: () =>
    get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    put<ApiResponse<User>>('/user/profile', data),

  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    put<ApiResponse<void>>('/user/password', data),
};
