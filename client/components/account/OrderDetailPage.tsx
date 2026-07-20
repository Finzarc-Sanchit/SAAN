'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { OrderDeliveryAddress } from '@/components/account/order/OrderDeliveryAddress';
import { OrderLineItemsList } from '@/components/account/order/OrderLineItemsList';
import { OrderStatusBadge } from '@/components/account/order/OrderStatusBadge';
import { OrderStatusProgress } from '@/components/account/order/OrderStatusProgress';
import { OrderSummaryAside } from '@/components/account/order/OrderSummaryAside';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatShortOrderId } from '@/lib/admin/order-format';
import { formatAccountDate, formatAccountStatus } from '@/lib/account-format';
import { getOrderStatusMessage } from '@/lib/account/order-ui';
import { fetchOrder, ordersQueryKeys } from '@/lib/api/orders';

function OrderDetailLoading() {
  return (
    <section className="space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-4 border-b border-neutral-300 pb-8">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-full max-w-md" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </section>
  );
}

export function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderRef =
    typeof params.orderNumber === 'string' ? decodeURIComponent(params.orderNumber) : '';

  const orderQuery = useQuery({
    queryKey: ordersQueryKeys.customerDetail(orderRef),
    queryFn: () => fetchOrder(orderRef),
    enabled: Boolean(orderRef),
  });

  if (orderQuery.isLoading) {
    return <OrderDetailLoading />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <section aria-labelledby="order-detail-error-heading">
        <Link
          href="/account/orders"
          className="inline-flex min-h-11 items-center gap-2 text-ui text-neutral-600 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.25} aria-hidden />
          Back to order history
        </Link>
        <div className="mt-10 border border-neutral-300 px-6 py-12">
          <h2 id="order-detail-error-heading" className="text-h2 text-ink">
            Order unavailable
          </h2>
          <p className="mt-3 max-w-md text-body text-neutral-700">
            We could not find this order. It may have been removed or linked incorrectly.
          </p>
          <Link
            href="/account/orders"
            className="mt-6 inline-flex min-h-11 items-center text-ui text-ink underline underline-offset-4"
          >
            View order history
          </Link>
        </div>
      </section>
    );
  }

  const order = orderQuery.data;
  const statusMessage = getOrderStatusMessage(order.status, order.paymentStatus);

  return (
    <section aria-labelledby="order-detail-heading">
      <Link
        href="/account/orders"
        className="inline-flex min-h-11 items-center gap-2 text-ui text-neutral-600 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.25} aria-hidden />
        Back to order history
      </Link>

      <header className="mt-6 border-b border-neutral-300 pb-8 sm:pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-caption uppercase tracking-[0.18em] text-neutral-500">Order</p>
          <OrderStatusBadge status={order.status} />
          {order.paymentStatus !== 'paid' ? (
            <span className="text-caption uppercase tracking-[0.12em] text-neutral-500">
              Payment {formatAccountStatus(order.paymentStatus)}
            </span>
          ) : null}
        </div>

        <h1
          id="order-detail-heading"
          className="mt-4 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none font-medium tracking-[-0.03em] text-ink"
        >
          {formatShortOrderId(order.orderNumber)}
        </h1>
        <p className="mt-3 text-body text-neutral-600">
          Placed {formatAccountDate(order.createdAt)}
        </p>
        <p className="mt-4 max-w-2xl text-body leading-relaxed text-neutral-700">
          {statusMessage}
        </p>
        <div className="mt-8">
          <OrderStatusProgress status={order.status} />
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-14 xl:gap-20">
        <div className="space-y-12">
          <OrderLineItemsList order={order} headingId="account-order-pieces-heading" />
          <OrderDeliveryAddress
            address={order.addressSnapshot}
            headingId="account-delivery-heading"
          />
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummaryAside order={order} />
        </div>
      </div>
    </section>
  );
}
