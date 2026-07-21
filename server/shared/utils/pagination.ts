import type { Pagination } from '../types/pagination';

export function normalizePagination(pagination: Pagination): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.max(1, Number(pagination.limit) || 20);
  const offset =
    pagination.offset !== undefined && Number.isFinite(pagination.offset)
      ? Math.max(0, Number(pagination.offset))
      : (page - 1) * limit;

  return {
    page,
    limit,
    skip: offset,
  };
}
