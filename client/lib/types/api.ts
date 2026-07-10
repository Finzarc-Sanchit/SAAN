export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details: ApiErrorDetail[];
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ErrorResponse = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
