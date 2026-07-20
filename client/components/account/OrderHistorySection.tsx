'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageOpen } from 'lucide-react';
import { OrderItemThumbnail } from '@/components/account/order/OrderItemThumbnail';
import { OrderStatusBadge } from '@/components/account/order/OrderStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { CtaButton } from '@/components/ui/CtaButton';
import { formatShortOrderId, getOrderPublicRef } from '@/lib/admin/order-format';
import { formatAccountDate, formatAccountStatus } from '@/lib/account-format';
import { getUniqueOrderPreviewImages } from '@/lib/account/order-ui';
import { listMyOrders, ordersQueryKeys } from '@/lib/api/orders';
import { formatPrice } from '@/lib/site-content';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types/order';

function OrderLoadingState() {
  return (
    <div className="divide-y divide-neutral-300 border-t border-neutral-300">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex gap-5 py-8 md:gap-8 md:py-10">
          <Skeleton className="h-20 w-[4.5rem] shrink-0" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="hidden h-6 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}

function OrderPreviewStack({
  order,
  extraCount,
}: {
  order: Order;
  extraCount: number;
}) {
  const images = getUniqueOrderPreviewImages(order.items);

  if (images.length === 0) {
    return <OrderItemThumbnail src={null} alt="" size="md" />;
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {images.map((src, index) => (
          <OrderItemThumbnail
            key={`${order.id}-preview-${index}`}
            src={src}
            alt=""
            size="md"
            className={cn('shadow-[0_0_0_2px_var(--color-paper)]', index > 0 && 'relative z-10')}
          />
        ))}
      </div>
      {extraCount > 0 ? (
        <span className="ml-3 text-caption text-neutral-500">+{extraCount}</span>
      ) : null}
    </div>
  );
}

function OrderHistoryCard({ order }: { order: Order }) {
  const publicRef = getOrderPublicRef(order);
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const uniqueLineCount = new Set(order.items.map((item) => item.productId)).size;
  const previewLimit = 3;
  const extraCount = Math.max(0, uniqueLineCount - previewLimit);
  const detailHref = `/account/orders/${encodeURIComponent(publicRef)}`;

  return (
    <article className="group border-b border-neutral-300 py-8 md:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Link
          href={detailHref}
          className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          aria-label={`View order ${formatShortOrderId(publicRef)}`}
        >
          <OrderPreviewStack order={order} extraCount={extraCount} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-caption uppercase tracking-[0.16em] text-neutral-500">
              {formatShortOrderId(publicRef)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>

          <Link
            href={detailHref}
            className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <h3 className="text-[clamp(1.15rem,2.2vw,1.35rem)] font-medium leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-neutral-700">
              {formatAccountDate(order.createdAt)}
            </h3>
          </Link>

          <p className="mt-2 text-body text-neutral-700">
            {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
            {' · '}
            {order.addressSnapshot.city}, {order.addressSnapshot.state}
          </p>
          <p className="mt-1 text-caption text-neutral-500">
            Payment {formatAccountStatus(order.paymentStatus)}
          </p>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
          <p className="text-body-medium text-ink">
            {formatPrice(order.total, order.currency)}
          </p>
          <Link
            href={detailHref}
            className="inline-flex min-h-11 items-center gap-1.5 text-ui text-ink underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            View details
            <ChevronRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function OrderHistorySection() {
  const ordersQuery = useQuery({
    queryKey: ordersQueryKeys.customerList(),
    queryFn: () => listMyOrders({ limit: 50 }),
  });
  const orders = ordersQuery.data ?? [];

  const stats = useMemo(() => {
    const open = orders.filter(
      (order) =>
        order.status === 'pending' ||
        order.status === 'confirmed' ||
        order.status === 'shipped',
    ).length;
    return { total: orders.length, open };
  }, [orders]);

  return (
    <section
      id="order-history"
      aria-labelledby="order-history-heading"
      className="scroll-mt-28"
    >
      <header className="border-b border-neutral-300 pb-8 sm:pb-10">
        <p className="text-caption uppercase tracking-[0.18em] text-neutral-500">Account</p>
        <h2
          id="order-history-heading"
          className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none font-medium tracking-[-0.03em] text-ink"
        >
          Order history
        </h2>
        <p className="mt-4 max-w-lg text-body leading-relaxed text-neutral-700">
          Every purchase, quietly kept — track fulfilment and revisit what you ordered.
        </p>
        {!ordersQuery.isLoading && orders.length > 0 ? (
          <p className="mt-5 text-caption text-neutral-500">
            {stats.total} {stats.total === 1 ? 'order' : 'orders'}
            {stats.open > 0 ? ` · ${stats.open} in progress` : ''}
          </p>
        ) : null}
      </header>

      <div className="mt-2">
        {ordersQuery.isLoading ? (
          <OrderLoadingState />
        ) : ordersQuery.isError ? (
          <div className="mt-8 border border-neutral-300 px-6 py-10">
            <p className="text-body text-ink">We could not load your orders.</p>
            <button
              type="button"
              onClick={() => void ordersQuery.refetch()}
              className="mt-4 text-ui text-neutral-700 underline underline-offset-4 hover:text-ink"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 flex min-h-72 flex-col items-center justify-center border border-dashed border-neutral-300 px-6 text-center">
            <PackageOpen
              className="h-7 w-7 text-neutral-500"
              strokeWidth={1.25}
              aria-hidden
            />
            <h3 className="mt-6 text-h2 text-ink">No orders yet</h3>
            <p className="mt-3 max-w-md text-body text-neutral-700">
              When you place an order, it will appear here with its fulfilment status.
            </p>
            <CtaButton href="/shop" className="mt-8">
              Explore the shop
            </CtaButton>
          </div>
        ) : (
          <div className="border-t border-neutral-300">
            {orders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
