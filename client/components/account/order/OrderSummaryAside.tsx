import { formatShortOrderId } from '@/lib/admin/order-format';
import { formatAccountDate, formatAccountStatus } from '@/lib/account-format';
import { formatPrice } from '@/lib/site-content';
import type { Order } from '@/lib/types/order';

type OrderSummaryAsideProps = {
  order: Order;
  showAccountHint?: boolean;
};

export function OrderSummaryAside({ order, showAccountHint = false }: OrderSummaryAsideProps) {
  const merchandiseTotal = order.items.reduce((sum, line) => sum + line.totalPrice, 0);
  const isPaid = order.paymentStatus === 'paid';

  return (
    <aside className="border border-neutral-300 bg-paper/80 p-6 md:p-8">
      <p className="text-caption uppercase tracking-[0.18em] text-neutral-500">Summary</p>
      <dl className="mt-6 space-y-4 text-body">
        <div className="flex justify-between gap-6">
          <dt className="text-neutral-600">Order</dt>
          <dd className="text-ink">{formatShortOrderId(order.orderNumber)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-neutral-600">Placed</dt>
          <dd className="text-right text-ink">{formatAccountDate(order.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-neutral-600">Status</dt>
          <dd className="text-ink">{formatAccountStatus(order.status)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-neutral-600">Payment</dt>
          <dd className="text-ink">{formatAccountStatus(order.paymentStatus)}</dd>
        </div>
        <div className="flex justify-between gap-6 border-t border-neutral-300 pt-4">
          <dt className="text-neutral-600">Subtotal</dt>
          <dd className="text-ink">{formatPrice(merchandiseTotal, order.currency)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-neutral-600">Shipping</dt>
          <dd className={order.shippingCharge > 0 ? 'text-ink' : 'text-[#03A685]'}>
            {order.shippingCharge > 0
              ? formatPrice(order.shippingCharge, order.currency)
              : 'Complimentary'}
          </dd>
        </div>
        <div className="flex justify-between gap-6 border-t border-neutral-300 pt-4 text-body-medium">
          <dt className="text-ink">Total</dt>
          <dd className="text-ink">{formatPrice(order.total, order.currency)}</dd>
        </div>
      </dl>
      {showAccountHint && isPaid ? (
        <p className="mt-6 text-caption leading-relaxed text-neutral-500">
          A confirmation will appear in your account order history.
        </p>
      ) : null}
    </aside>
  );
}
