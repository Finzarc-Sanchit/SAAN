export type ReviewListSort = 'newest' | 'oldest' | 'rating_high' | 'rating_low';

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewInput = {
  rating: number;
  review: string;
};

export type ReviewListParams = {
  page?: number;
  limit?: number;
  sort?: ReviewListSort;
};
