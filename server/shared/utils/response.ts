export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T>(data: T, meta?: PaginationMeta): SuccessResponse<T> {
  if (meta) {
    return { success: true, data, meta };
  }
  return { success: true, data };
}

export function errorResponse(
  code: string,
  message: string,
  details: unknown[] = [],
): ErrorResponse {
  return {
    success: false,
    error: { code, message, details },
  };
}
