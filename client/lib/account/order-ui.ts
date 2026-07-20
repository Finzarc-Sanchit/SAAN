import type { OrderItem, OrderPaymentStatus, OrderStatus } from '@/lib/types/order';

export function getOrderItemImageUrl(item: OrderItem): string | null {
  const snapshot = item.productImageSnapshot?.trim();
  return snapshot || null;
}

export type OrderStatusStep = {
  key: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  label: string;
};

export const ORDER_STATUS_STEPS: OrderStatusStep[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export function getActiveOrderStepIndex(status: OrderStatus): number {
  return STATUS_STEP_INDEX[status];
}

export function getOrderStatusMessage(
  status: OrderStatus,
  paymentStatus: OrderPaymentStatus,
): string {
  if (status === 'cancelled') {
    return 'This order was cancelled.';
  }
  if (paymentStatus === 'pending' && status === 'pending') {
    return 'Your order is saved. We will begin preparation once payment is complete.';
  }
  if (paymentStatus === 'failed') {
    return 'Payment did not complete. You may retry from checkout or contact us for help.';
  }
  switch (status) {
    case 'pending':
      return 'We have received your order and are preparing it for dispatch.';
    case 'confirmed':
      return 'Your order is confirmed and being prepared with care.';
    case 'shipped':
      return 'Your order is on its way.';
    case 'delivered':
      return 'Delivered. We hope you enjoy your pieces.';
    default:
      return '';
  }
}

export function orderStatusTone(status: OrderStatus): string {
  switch (status) {
    case 'delivered':
      return 'border-neutral-700 text-ink';
    case 'shipped':
    case 'confirmed':
      return 'border-ink/40 text-ink';
    case 'cancelled':
      return 'border-neutral-300 text-neutral-500';
    default:
      return 'border-neutral-300 text-neutral-700';
  }
}

export function getUniqueOrderPreviewImages(
  items: { productId: string; productImageSnapshot?: string | null }[],
  limit = 3,
): (string | null)[] {
  const seen = new Set<string>();
  const images: (string | null)[] = [];

  for (const item of items) {
    const key = item.productImageSnapshot?.trim() || item.productId;
    if (seen.has(key)) continue;
    seen.add(key);
    images.push(item.productImageSnapshot?.trim() || null);
    if (images.length >= limit) break;
  }

  return images;
}
