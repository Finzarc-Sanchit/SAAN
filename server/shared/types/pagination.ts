export type Pagination = {
  page: number;
  limit: number;
  offset?: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
