'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { RatingStars } from '@/components/product/RatingStars';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  createProductReview,
  listProductReviews,
  reviewQueryKeys,
} from '@/lib/api/reviews';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { fetchProductBySlug, productsQueryKeys } from '@/lib/api/products';
import type { ProductDetail, ProductReview } from '@/lib/product-defaults';
import type { Review } from '@/lib/types/review';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';

type ProductReviewsSectionProps = {
  product: ProductDetail;
};

type ReviewDisplay = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

const REVIEW_PAGE_SIZE = 6;
const REVIEW_PREVIEW_COUNT = 3;
const REVIEW_LIST_PARAMS = { limit: REVIEW_PAGE_SIZE, sort: 'newest' as const };

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function mapApiReview(review: Review): ReviewDisplay {
  return {
    id: review.id,
    author: 'Verified client',
    rating: review.rating,
    text: review.review,
    date: formatReviewDate(review.createdAt),
  };
}

function mapStaticReview(review: ProductReview): ReviewDisplay {
  return {
    id: review.id,
    author: review.author,
    rating: review.rating,
    text: review.text,
    date: review.date,
  };
}

function averageFromReviews(reviews: ReviewDisplay[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    requireAuth,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useRequireAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [localReviews, setLocalReviews] = useState<ReviewDisplay[]>(() =>
    product.reviews.map(mapStaticReview),
  );
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const productQuery = useQuery({
    queryKey: productsQueryKeys.storefrontDetail(product.slug),
    queryFn: () => fetchProductBySlug(product.slug),
    retry: false,
  });
  const apiProduct = productQuery.data;
  const isCatalogOnly =
    productQuery.isError || (!productQuery.isLoading && !apiProduct);
  const usesApiReviews = Boolean(apiProduct?.id);

  const reviewsQuery = useInfiniteQuery({
    queryKey: reviewQueryKeys.infinite(
      apiProduct?.id ?? '',
      REVIEW_LIST_PARAMS,
    ),
    queryFn: ({ pageParam }) =>
      listProductReviews(apiProduct!.id, {
        ...REVIEW_LIST_PARAMS,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.meta.page * lastPage.meta.limit;
      return loadedCount < lastPage.meta.total
        ? lastPage.meta.page + 1
        : undefined;
    },
    enabled: usesApiReviews,
  });

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !showAllReviews || !reviewsQuery.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !reviewsQuery.isFetchingNextPage) {
          void reviewsQuery.fetchNextPage();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    reviewsQuery.fetchNextPage,
    reviewsQuery.hasNextPage,
    reviewsQuery.isFetchingNextPage,
    showAllReviews,
  ]);

  const createReviewMutation = useMutation({
    mutationFn: (input: { rating: number; review: string }) =>
      createProductReview(apiProduct!.id, input),
    onSuccess: async () => {
      setRating(0);
      setHoveredRating(0);
      setReviewText('');
      setFormError(null);
      setIsSubmitted(true);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: reviewQueryKeys.product(apiProduct!.id),
        }),
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.storefrontDetail(product.slug),
        }),
      ]);
    },
    onError: (error: Error) => {
      setIsSubmitted(false);
      setFormError(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Your review could not be submitted. Please try again.',
      );
    },
  });

  const reviews = usesApiReviews
    ? (reviewsQuery.data?.pages.flatMap((page) => page.items) ?? []).map(
        mapApiReview,
      )
    : localReviews;
  const visibleReviews = showAllReviews
    ? reviews
    : reviews.slice(0, REVIEW_PREVIEW_COUNT);
  const averageRating = usesApiReviews
    ? (apiProduct?.ratingsAverage ?? product.rating)
    : averageFromReviews(localReviews);
  const reviewCount = usesApiReviews
    ? (apiProduct?.ratingsCount ?? product.reviewCount)
    : localReviews.length;
  // Keep SSR and first client paint identical — auth is restored from localStorage only on the client.
  const showReviewForm = hasMounted && !isAuthLoading && isAuthenticated;
  const isSubmitting = createReviewMutation.isPending || isLocalSubmitting;
  const canSubmitReview = showReviewForm && (usesApiReviews || isCatalogOnly);
  const canViewAllReviews =
    reviews.length > REVIEW_PREVIEW_COUNT || Boolean(reviewsQuery.hasNextPage);

  function submitLocalReview(nextRating: number, nextReview: string) {
    setIsLocalSubmitting(true);
    const now = new Date();
    const authorName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const entry: ReviewDisplay = {
      id: `local-${now.getTime()}`,
      author: authorName || 'You',
      rating: nextRating,
      text: nextReview,
      date: formatReviewDate(now.toISOString()),
    };

    setLocalReviews((prev) => [entry, ...prev]);
    setRating(0);
    setHoveredRating(0);
    setReviewText('');
    setFormError(null);
    setIsSubmitted(true);
    setIsLocalSubmitting(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(false);

    if (rating === 0) {
      setFormError('Please select a star rating.');
      return;
    }

    const review = reviewText.trim();
    if (!review) {
      setFormError('Please share a few words about your experience.');
      return;
    }

    setFormError(null);

    requireAuth(() => {
      if (usesApiReviews && apiProduct) {
        createReviewMutation.mutate({ rating, review });
        return;
      }

      // Catalog / mock PDP: accept the review locally so submission stays available
      // while the storefront product is not yet backed by the API.
      submitLocalReview(rating, review);
    });
  }

  return (
    <section
      id="product-reviews"
      aria-labelledby="product-reviews-heading"
      className="border-t border-neutral-300 bg-paper py-16 md:py-24"
    >
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 id="product-reviews-heading" className="text-h2 text-ink">
              Reviews
            </h2>
            <div className="mt-6 flex items-end gap-4">
              <span className="font-display text-5xl leading-none text-ink">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <RatingStars rating={averageRating} size="md" />
                <p className="text-caption mt-1 text-neutral-500">
                  Based on {reviewCount}{' '}
                  {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {showReviewForm ? (
              <form
                onSubmit={handleSubmit}
                className="mt-10 border-t border-neutral-300 pt-8"
              >
                <fieldset>
                  <legend className="text-body-medium text-ink">
                    Share your experience
                  </legend>
                  <div
                    className="mt-4 flex w-fit gap-1"
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {Array.from({ length: 5 }, (_, index) => {
                      const starValue = index + 1;
                      const isActive = starValue <= (hoveredRating || rating);

                      return (
                        <button
                          key={starValue}
                          type="button"
                          aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
                          aria-pressed={rating === starValue}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onFocus={() => setHoveredRating(starValue)}
                          onBlur={() => setHoveredRating(0)}
                          onClick={() => {
                            setRating(starValue);
                            setFormError(null);
                          }}
                          className="p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        >
                          <Star
                            className={cn(
                              'size-6 transition-colors',
                              isActive
                                ? 'fill-ink text-ink'
                                : 'text-neutral-300',
                            )}
                            strokeWidth={1.4}
                          />
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <label htmlFor="product-review" className="sr-only">
                  Your review
                </label>
                <textarea
                  id="product-review"
                  value={reviewText}
                  onChange={(event) => {
                    setReviewText(event.target.value);
                    setFormError(null);
                  }}
                  maxLength={2000}
                  rows={5}
                  placeholder="Tell us about the fit, fabric, and how the piece felt to wear."
                  className="text-body mt-5 w-full resize-y border border-neutral-300 bg-paper px-4 py-3 text-ink outline-none transition-colors placeholder:text-neutral-500 focus:border-ink"
                />

                {formError && (
                  <p className="text-caption mt-3 text-error" role="alert">
                    {formError}
                  </p>
                )}
                {isSubmitted && (
                  <p className="text-caption mt-3 text-success" role="status">
                    Thank you. Your review has been added.
                  </p>
                )}

                <CtaButton
                  type="submit"
                  variant="secondary"
                  className="mt-5"
                  disabled={!canSubmitReview || isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit review'}
                </CtaButton>
              </form>
            ) : (
              <div className="mt-10 border-t border-neutral-300 pt-8">
                <p className="text-body text-neutral-700">
                  Sign in to share your experience with this piece.
                </p>
                <CtaButton
                  type="button"
                  variant="secondary"
                  className="mt-5"
                  disabled={isAuthLoading}
                  onClick={() => requireAuth(() => undefined)}
                >
                  Sign in to review
                </CtaButton>
              </div>
            )}
          </div>

          <div>
            {reviewsQuery.isLoading && usesApiReviews ? (
              <p className="text-body text-neutral-500" role="status">
                Loading reviews…
              </p>
            ) : visibleReviews.length > 0 ? (
              <>
                <div className="divide-y divide-neutral-300 border-t border-neutral-300">
                  {visibleReviews.map((review) => (
                    <article key={review.id} className="py-7 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-body-medium text-ink">
                            {review.author}
                          </p>
                          <p className="text-caption mt-1 text-neutral-500">
                            {review.date}
                          </p>
                        </div>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="text-body mt-4 max-w-2xl text-neutral-700">
                        {review.text}
                      </p>
                    </article>
                  ))}
                </div>

                {!showAllReviews && canViewAllReviews && (
                  <button
                    type="button"
                    onClick={() => setShowAllReviews(true)}
                    className="text-ui mt-8 border-b border-ink pb-1 text-ink transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    View all {reviewCount} reviews
                  </button>
                )}

                {showAllReviews && (
                  <div
                    ref={loadMoreRef}
                    className="flex min-h-12 items-center pt-4"
                  >
                    {reviewsQuery.isFetchingNextPage ? (
                      <p
                        className="text-caption text-neutral-500"
                        role="status"
                      >
                        Loading more reviews…
                      </p>
                    ) : reviewsQuery.hasNextPage ? (
                      <span className="sr-only">
                        More reviews load as you scroll.
                      </span>
                    ) : (
                      <p className="text-caption text-neutral-500">
                        You have reached the end of the reviews.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="border-t border-neutral-300 pt-7">
                <p className="text-body text-neutral-700">
                  No reviews yet. Be the first to share your experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
