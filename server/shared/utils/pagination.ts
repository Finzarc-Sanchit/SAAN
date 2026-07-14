import type { Pagination } from '../types/pagination';

export function normalizePagination(pagination: Pagination): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.max(1, Number(pagination.limit) || 20);
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
