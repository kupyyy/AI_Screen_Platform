import { get, post, put, del } from './request';
import type { ApiResponse, Project, ScreenDSL } from '@/types';

export const projectApi = {
  getList: () =>
    get<ApiResponse<Project[]>>('/projects'),

  getById: (id: string) =>
    get<ApiResponse<Project>>(`/projects/${id}`),

  create: (data: { name: string; description?: string; dsl: ScreenDSL }) =>
    post<ApiResponse<Project>>('/projects', data),

  update: (id: string, data: { name?: string; description?: string; dsl?: ScreenDSL }) =>
    put<ApiResponse<Project>>(`/projects/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<void>>(`/projects/${id}`),
};
