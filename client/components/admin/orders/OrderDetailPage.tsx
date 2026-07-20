'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  OrderPaymentStatusBadge,
  OrderStatusBadge,
} from '@/components/admin/orders/OrderStatusBadge';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { formatInr } from '@/lib/admin/format';
import {
  formatOrderDateTime,
  formatShortOrderId,
} from '@/lib/admin/order-format';
import {
  getAllowedNextStatuses,
  ORDER_STATUS_LABELS,
} from '@/lib/admin/order-status';
import {
  fetchAdminOrder,
  listOrderPayments,
  ordersQueryKeys,
  updateOrderStatus,
} from '@/lib/api/orders';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { listSizes, sizesQueryKeys } from '@/lib/api/sizes';
import type { OrderStatus } from '@/lib/types/order';

type OrderDetailPageProps = {
  orderId: string;
};

function formatAddressLines(address: {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
}): string[] {
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

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();

  const detailQuery = useQuery({
    queryKey: ordersQueryKeys.detail(orderId),
    queryFn: () => fetchAdminOrder(orderId),
  });

  const paymentsQuery = useQuery({
    queryKey: ordersQueryKeys.payments(orderId),
    queryFn: () => listOrderPayments(orderId),
    enabled: Boolean(orderId),
  });

  const sizesQuery = useQuery({
    queryKey: sizesQueryKeys.list(),
    queryFn: listSizes,
  });

  const sizeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const size of sizesQuery.data ?? []) {
      map.set(size.sizeId, size.label);
    }
    return map;
  }, [sizesQuery.data]);

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      toast('Order status updated');
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not update order status',
        'error',
      );
    },
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
                : 'Could not load order'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        </AdminCard>
      </div>
    );
  }

  const order = detailQuery.data;
  const nextStatuses = getAllowedNextStatuses(order.status);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <BackLink />
          <h1 className="mt-2 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
            Order {formatShortOrderId(order.orderNumber)}
          </h1>
          <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-paper/45">
            Placed {formatOrderDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <OrderPaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminCard title="Customer" className="lg:col-span-1">
          <div className="space-y-1 font-body text-sm">
            <p className="font-medium text-saan-charcoal dark:text-paper">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-saan-ink/70 dark:text-paper/70">{order.customer.email}</p>
          </div>
        </AdminCard>

        <AdminCard title="Shipping address (at order time)" className="lg:col-span-2">
          <p className="mb-3 font-body text-xs text-saan-ink/50 dark:text-paper/50">
            Historical snapshot from checkout. The customer&apos;s saved addresses may have changed
            since this order was placed.
          </p>
          <address className="space-y-0.5 not-italic font-body text-sm text-saan-charcoal dark:text-paper">
            {formatAddressLines(order.addressSnapshot).map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
        </AdminCard>
      </div>

      <AdminCard title="Line items">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-saan-champagne/40 dark:border-white/10">
                {['Product', 'Size', 'Qty', 'Unit price', 'Line total'].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-2 font-body text-xs font-medium text-saan-ink/45 dark:text-paper/45"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.orderItemId}
                  className="border-b border-saan-champagne/30 last:border-0 dark:border-white/5"
                >
                  <td className="px-3 py-3 font-body text-sm font-medium">
                    {item.productNameSnapshot}
                  </td>
                  <td className="px-3 py-3 font-body text-sm text-saan-ink/70 dark:text-paper/70">
                    {sizeLabelById.get(item.sizeId) ?? item.sizeId}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{item.quantity}</td>
                  <td className="px-3 py-3 tabular-nums">{formatInr(item.unitPrice)}</td>
                  <td className="px-3 py-3 tabular-nums font-medium">
                    {formatInr(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 ml-auto max-w-xs space-y-2 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-saan-ink/60 dark:text-paper/60">Subtotal</dt>
            <dd className="tabular-nums">{formatInr(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-saan-ink/60 dark:text-paper/60">Discount</dt>
            <dd className="tabular-nums">−{formatInr(order.discount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-saan-ink/60 dark:text-paper/60">Shipping</dt>
            <dd className="tabular-nums">{formatInr(order.shippingCharge)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-saan-champagne/40 pt-2 font-medium dark:border-white/10">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatInr(order.total)}</dd>
          </div>
        </dl>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard title="Payment">
          {paymentsQuery.isLoading ? (
            <AdminSkeleton className="h-24 w-full rounded-xl" />
          ) : paymentsQuery.isError ? (
            <AdminInlineError onRetry={() => void paymentsQuery.refetch()} />
          ) : (paymentsQuery.data?.length ?? 0) === 0 ? (
            <p className="font-body text-sm text-saan-ink/50 dark:text-paper/50">
              No payment records yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {paymentsQuery.data?.map((payment) => (
                <li
                  key={payment.id}
                  className="rounded-lg border border-saan-champagne/50 px-3 py-3 dark:border-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-body text-sm font-medium capitalize">{payment.status}</p>
                    <p className="font-body text-sm tabular-nums">{formatInr(payment.amount)}</p>
                  </div>
                  <dl className="mt-2 grid gap-1 font-body text-xs text-saan-ink/60 dark:text-paper/60">
                    <div className="flex justify-between gap-3">
                      <dt>Method</dt>
                      <dd className="capitalize">{payment.paymentMethod}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Gateway</dt>
                      <dd>{payment.paymentGateway}</dd>
                    </div>
                    {payment.paidAt ? (
                      <div className="flex justify-between gap-3">
                        <dt>Paid at</dt>
                        <dd>{formatOrderDateTime(payment.paidAt)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Update status">
          <p className="mb-3 font-body text-sm text-saan-ink/60 dark:text-paper/60">
            Current: <span className="font-medium">{ORDER_STATUS_LABELS[order.status]}</span>
          </p>
          {nextStatuses.length === 0 ? (
            <p className="font-body text-sm text-saan-ink/50 dark:text-paper/50">
              No further status changes available from this state.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <AdminButton
                  key={status}
                  variant={status === 'cancelled' ? 'danger' : 'secondary'}
                  isLoading={statusMutation.isPending}
                  disabled={statusMutation.isPending}
                  onClick={() => void statusMutation.mutateAsync(status)}
                >
                  Mark {ORDER_STATUS_LABELS[status]}
                </AdminButton>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/orders"
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-ink dark:text-paper/55 dark:hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Orders
    </Link>
  );
}
