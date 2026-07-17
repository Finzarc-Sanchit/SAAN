'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import { fetchOrder, ordersQueryKeys } from '@/lib/api/orders';
import { formatPrice } from '@/lib/site-content';

export function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const { isAuthenticated, isLoading: authLoading, openLoginDialog } = useAuth();

  const orderQuery = useQuery({
    queryKey: ordersQueryKeys.customerDetail(orderId),
    queryFn: () => fetchOrder(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });

  if (authLoading || orderQuery.isLoading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center py-24">
        <Spinner />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="py-24">
        <Container className="max-w-xl text-center">
          <h1 className="text-h2 text-ink">Sign in to view your order</h1>
          <CtaButton
            type="button"
            className="mt-8"
            onClick={() => openLoginDialog('login')}
          >
            Sign in
          </CtaButton>
        </Container>
      </section>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <section className="py-24">
        <Container className="max-w-xl text-center">
          <h1 className="text-h2 text-ink">Order unavailable</h1>
          <p className="mt-4 text-body text-neutral-600">
            We could not find this confirmation. Check your account orders or continue shopping.
          </p>
          <CtaButton href="/shop" className="mt-8">
            Continue shopping
          </CtaButton>
        </Container>
      </section>
    );
  }

  const order = orderQuery.data;
  const isPaid = order.paymentStatus === 'paid';

  return (
    <section className="bg-paper py-16 md:py-24">
      <Container className="max-w-2xl">
        <p className="text-caption uppercase tracking-[0.18em] text-neutral-500">
          {isPaid ? 'Confirmed' : 'Received'}
        </p>
        <h1 className="mt-3 text-h2 text-ink">
          {isPaid ? 'Thank you for your order' : 'Order placed'}
        </h1>
        <p className="mt-4 text-body text-neutral-600">
          {isPaid
            ? 'Payment was successful. We will prepare your piece for dispatch.'
            : 'Your order is saved. Complete payment if it is still pending.'}
        </p>

        <div className="mt-10 space-y-4 border border-neutral-300 bg-paper p-6">
          <div className="flex justify-between text-body">
            <span className="text-neutral-600">Status</span>
            <span className="text-ink capitalize">{order.status}</span>
          </div>
          <div className="flex justify-between text-body">
            <span className="text-neutral-600">Payment</span>
            <span className="text-ink capitalize">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between text-body">
            <span className="text-neutral-600">Total</span>
            <span className="text-ink">{formatPrice(order.total, order.currency)}</span>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {order.items.map((line) => (
            <li
              key={line.orderItemId}
              className="flex justify-between gap-4 border-b border-neutral-300 pb-4 text-body"
            >
              <div>
                <p className="text-ink">{line.productNameSnapshot}</p>
                <p className="mt-1 text-caption text-neutral-500">Qty {line.quantity}</p>
              </div>
              <p className="text-ink">{formatPrice(line.totalPrice, order.currency)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-4">
          <CtaButton href="/shop">Continue shopping</CtaButton>
          <Link
            href="/account"
            className="inline-flex items-center text-caption uppercase tracking-[0.14em] text-neutral-600 underline-offset-4 hover:text-ink hover:underline"
          >
            View account
          </Link>
        </div>
      </Container>
    </section>
  );
}
