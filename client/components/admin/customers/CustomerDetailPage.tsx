'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  OrderPaymentStatusBadge,
  OrderStatusBadge,
} from '@/components/admin/orders/OrderStatusBadge';
import { formatInr } from '@/lib/admin/format';
import {
  formatOrderDateTime,
  formatShortOrderId,
} from '@/lib/admin/order-format';
import { customersQueryKeys, fetchAdminCustomer } from '@/lib/api/customers';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { CustomerAddress } from '@/lib/types/customer';
import { cn } from '@/lib/utils';

type CustomerDetailPageProps = {
  customerId: string;
};

function BackLink() {
  return (
    <Link
      href="/admin/customers"
      className="inline-flex items-center gap-2 font-body text-sm text-ink transition-colors hover:text-ink/80 dark:text-ink dark:hover:text-ink/80"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Back to customers
    </Link>
  );
}

function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        isVerified
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-saan-champagne/40 text-saan-ink/70 dark:bg-white/10 dark:text-paper/70',
      )}
    >
      {isVerified ? 'Verified' : 'Unverified'}
    </span>
  );
}

function formatAddressLines(address: CustomerAddress): string[] {
  const lines = [
    `${address.firstName} ${address.lastName}`,
    address.phone,
    address.address,
  ];
  if (address.apartment) {
    lines.push(address.apartment);
  }
  lines.push(`${address.city}, ${address.state} ${address.postalCode}`);
  return lines;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const detailQuery = useQuery({
    queryKey: customersQueryKeys.detail(customerId),
    queryFn: () => fetchAdminCustomer(customerId),
  });

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-4">
        <BackLink />
        <AdminCard>
          <AdminSkeleton className="h-64 w-full rounded-xl" />
        </AdminCard>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="space-y-4">
        <BackLink />
        <AdminCard>
          <AdminInlineError
            message={
              detailQuery.error instanceof ApiError
                ? getApiErrorMessage(detailQuery.error)
                : 'Could not load customer'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        </AdminCard>
      </div>
    );
  }

  const customer = detailQuery.data;

  return (
    <div className="space-y-4 lg:space-y-6">
      <BackLink />

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Customer profile
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="mt-1 text-sm text-saan-ink/60 dark:text-paper/60">{customer.email}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <h2 className="font-display text-lg text-saan-charcoal dark:text-paper">
            Overview
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:text-paper/50">
                Email status
              </dt>
              <dd className="mt-1">
                <VerifiedBadge isVerified={customer.isVerified} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:text-paper/50">
                Joined
              </dt>
              <dd className="mt-1 text-sm">{formatOrderDateTime(customer.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:text-paper/50">
                Orders
              </dt>
              <dd className="mt-1 text-sm tabular-nums">{customer.orderCount}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:text-paper/50">
                Total spent
              </dt>
              <dd className="mt-1 text-sm font-medium tabular-nums">
                {formatInr(customer.totalSpent)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:text-paper/50">
                Last order
              </dt>
              <dd className="mt-1 text-sm">
                {customer.lastOrderAt
                  ? formatOrderDateTime(customer.lastOrderAt)
                  : 'No orders yet'}
              </dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-lg text-saan-charcoal dark:text-paper">
            Saved addresses
          </h2>
          {customer.addresses.length === 0 ? (
            <p className="mt-4 text-sm text-saan-ink/60 dark:text-paper/60">
              No saved addresses.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {customer.addresses.map((address) => (
                <li
                  key={address.addressId}
                  className="rounded-xl border border-saan-champagne/50 p-3 dark:border-white/10"
                >
                  {address.isDefault ? (
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink dark:text-ink">
                      Default
                    </p>
                  ) : null}
                  <address className="space-y-0.5 not-italic text-sm leading-relaxed text-saan-ink/80 dark:text-paper/80">
                    {formatAddressLines(address).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <AdminCard>
        <h2 className="font-display text-lg text-saan-charcoal dark:text-paper">
          Recent orders
        </h2>
        {customer.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-saan-ink/60 dark:text-paper/60">
            No orders placed yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-saan-champagne/50 text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:border-white/10 dark:text-paper/50">
                  <th className="px-2 py-2 font-bold">Order</th>
                  <th className="px-2 py-2 font-bold">Total</th>
                  <th className="px-2 py-2 font-bold">Status</th>
                  <th className="px-2 py-2 font-bold">Payment</th>
                  <th className="px-2 py-2 font-bold">Placed</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-saan-champagne/30 last:border-0 dark:border-white/5"
                  >
                    <td className="px-2 py-3">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}
                        className="font-mono text-sm font-medium text-ink hover:underline dark:text-ink"
                      >
                        {formatShortOrderId(order.orderNumber)}
                      </Link>
                    </td>
                    <td className="px-2 py-3 tabular-nums">{formatInr(order.total)}</td>
                    <td className="px-2 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-2 py-3">
                      <OrderPaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-2 py-3 text-saan-ink/70 dark:text-paper/70">
                      {formatOrderDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
