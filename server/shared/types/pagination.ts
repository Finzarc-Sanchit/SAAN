export type Pagination = {
  page: number;
  limit: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
