export type ReviewListSort = 'newest' | 'oldest' | 'rating_high' | 'rating_low';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateReviewInput = {
  productId: string;
  userId: string;
  rating: number;
  review: string;
};

export type UpdateReviewInput = {
  rating?: number;
  review?: string;
};

export type ReviewListOptions = {
  sort?: ReviewListSort;
};
