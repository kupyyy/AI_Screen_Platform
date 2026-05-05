// 通用 API 响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
