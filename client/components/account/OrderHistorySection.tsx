'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PackageOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatAccountDate, formatAccountStatus } from '@/lib/account-format';
import { listMyOrders, ordersQueryKeys } from '@/lib/api/orders';
import { formatPrice } from '@/lib/site-content';

function OrderLoadingState() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="border-y border-neutral-300 py-6">
          <div className="flex justify-between gap-6">
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderHistorySection() {
  const ordersQuery = useQuery({
    queryKey: ordersQueryKeys.customerList(),
    queryFn: () => listMyOrders({ limit: 50 }),
  });
  const orders = ordersQuery.data ?? [];

  return (
    <section
      id="order-history"
      aria-labelledby="order-history-heading"
      className="scroll-mt-28 border-t border-neutral-300 pt-6 sm:pt-8"
    >
      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] xl:gap-14">
        <div>
          <h2
            id="order-history-heading"
            className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-medium text-ink"
          >
            Order history
          </h2>
          <p className="mt-3 max-w-sm text-body leading-relaxed text-neutral-700">
            Review previous purchases and their current fulfilment status.
          </p>
        </div>

        <div>
          {ordersQuery.isLoading ? (
            <OrderLoadingState />
          ) : ordersQuery.isError ? (
            <div className="border border-neutral-300 px-6 py-10">
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
            <div className="flex min-h-56 flex-col items-center justify-center border border-dashed border-neutral-300 px-4 text-center sm:px-6">
              <PackageOpen
                className="h-6 w-6 text-neutral-500"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="mt-4 text-body-medium text-ink">No orders yet</p>
              <p className="mt-2 text-body text-neutral-700">
                Pieces you purchase will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex min-h-11 items-center bg-ink px-6 text-ui text-paper transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Explore the shop
              </Link>
            </div>
          ) : (
            <div className="border-t border-neutral-300">
              {orders.map((order) => {
                const itemCount = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0,
                );
                const orderNumber = order.id.slice(-8).toUpperCase();

                return (
                  <article key={order.id} className="border-b border-neutral-300 py-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-ui text-neutral-500">
                          Order #{orderNumber}
                        </p>
                        <p className="mt-2 text-body-medium text-ink">
                          {formatAccountDate(order.createdAt)}
                        </p>
                        <p className="mt-1 text-body text-neutral-700">
                          {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
                        </p>
                      </div>

                      <div className="flex items-start justify-between gap-8 sm:text-right">
                        <div>
                          <span className="inline-flex border border-neutral-300 px-2.5 py-1 text-[10px] tracking-[0.12em] text-neutral-700 uppercase">
                            {formatAccountStatus(order.status)}
                          </span>
                          <p className="mt-3 text-body-medium text-ink">
                            {formatPrice(order.total, order.currency)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <details className="group mt-5 border-t border-neutral-200 pt-4">
                      <summary className="cursor-pointer list-none text-ui text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-ink group-open:text-ink">
                        View order details
                      </summary>
                      <div className="mt-5 space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.orderItemId}
                            className="flex flex-col gap-2 text-body sm:flex-row sm:justify-between sm:gap-6"
                          >
                            <div>
                              <p className="text-ink">{item.productNameSnapshot}</p>
                              <p className="mt-1 text-neutral-500">
                                Quantity {item.quantity}
                              </p>
                            </div>
                            <p className="shrink-0 text-ink sm:text-right">
                              {formatPrice(item.totalPrice, order.currency)}
                            </p>
                          </div>
                        ))}
                        <div className="border-t border-neutral-200 pt-4 text-body text-neutral-700">
                          <p>
                            Delivering to {order.addressSnapshot.city},{' '}
                            {order.addressSnapshot.state}
                          </p>
                          <p className="mt-1">
                            Payment: {formatAccountStatus(order.paymentStatus)}
                          </p>
                        </div>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
