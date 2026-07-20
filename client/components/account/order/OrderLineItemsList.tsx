import { OrderItemThumbnail } from '@/components/account/order/OrderItemThumbnail';
import { getOrderItemImageUrl } from '@/lib/account/order-ui';
import { formatPrice } from '@/lib/site-content';
import type { Order } from '@/lib/types/order';

type OrderLineItemsListProps = {
  order: Order;
  headingId?: string;
};

export function OrderLineItemsList({ order, headingId = 'order-pieces-heading' }: OrderLineItemsListProps) {
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-caption uppercase tracking-[0.18em] text-neutral-500"
      >
        Pieces
      </h2>
      <ul className="mt-5 divide-y divide-neutral-300 border-y border-neutral-300">
        {order.items.map((line) => (
          <li
            key={line.orderItemId}
            className="flex gap-5 py-6 text-body sm:gap-6"
          >
            <OrderItemThumbnail
              src={getOrderItemImageUrl(line)}
              alt={line.productNameSnapshot}
              size="lg"
            />
            <div className="flex min-w-0 flex-1 justify-between gap-4 sm:gap-6">
              <div className="min-w-0">
                <p className="text-body-medium text-ink">{line.productNameSnapshot}</p>
                <p className="mt-2 text-caption text-neutral-500">
                  Quantity {line.quantity}
                  {line.quantity > 1 && line.unitPrice !== line.totalPrice
                    ? ` · ${formatPrice(line.unitPrice, order.currency)} each`
                    : ''}
                </p>
              </div>
              <p className="shrink-0 text-ink">
                {formatPrice(line.totalPrice, order.currency)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
