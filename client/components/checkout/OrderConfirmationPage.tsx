'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { OrderDeliveryAddress } from '@/components/account/order/OrderDeliveryAddress';
import { OrderLineItemsList } from '@/components/account/order/OrderLineItemsList';
import { OrderSummaryAside } from '@/components/account/order/OrderSummaryAside';
import { useAuth } from '@/components/providers/AuthProvider';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { OrderConfirmationSkeleton } from '@/components/checkout/OrderConfirmationSkeleton';
import { formatShortOrderId, getOrderPublicRef } from '@/lib/admin/order-format';
import { formatAccountDate } from '@/lib/account-format';
import { fetchOrder, ordersQueryKeys } from '@/lib/api/orders';

function ConfirmationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(11,10,9,0.04), transparent 60%)',
        }}
        aria-hidden
      />
      {children}
    </main>
  );
}

export function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderRef = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';
  const { isAuthenticated, isLoading: authLoading, openLoginDialog } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const orderQuery = useQuery({
    queryKey: ordersQueryKeys.customerDetail(orderRef),
    queryFn: () => fetchOrder(orderRef),
    enabled: isAuthenticated && Boolean(orderRef),
    refetchInterval: (query) => {
      if (query.state.data?.paymentStatus === 'paid') return false;
      if (query.state.dataUpdateCount >= 15) return false;
      return 2_000;
    },
    refetchIntervalInBackground: true,
  });

  if (authLoading || orderQuery.isLoading) {
    return <OrderConfirmationSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <ConfirmationShell>
        <Container className="flex min-h-screen max-w-xl flex-col items-center justify-center py-24 text-center">
          <p className="text-caption uppercase tracking-[0.22em] text-neutral-500">SAAN</p>
          <h1 className="mt-6 text-h2 text-ink">Sign in to view your order</h1>
          <p className="mt-4 text-body text-neutral-600">
            Your confirmation is waiting once you return to your account.
          </p>
          <CtaButton type="button" className="mt-10" onClick={() => openLoginDialog('login')}>
            Sign in
          </CtaButton>
        </Container>
      </ConfirmationShell>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <ConfirmationShell>
        <Container className="flex min-h-screen max-w-xl flex-col items-center justify-center py-24 text-center">
          <p className="text-caption uppercase tracking-[0.22em] text-neutral-500">SAAN</p>
          <h1 className="mt-6 text-h2 text-ink">Order unavailable</h1>
          <p className="mt-4 text-body text-neutral-600">
            We could not find this confirmation. Review your order history or continue shopping.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <CtaButton href="/account/orders">Order history</CtaButton>
            <CtaButton href="/shop" variant="secondary">
              Continue shopping
            </CtaButton>
          </div>
        </Container>
      </ConfirmationShell>
    );
  }

  const order = orderQuery.data;
  const isPaid = order.paymentStatus === 'paid';
  const publicRef = getOrderPublicRef(order);
  const accountOrderHref = `/account/orders/${encodeURIComponent(publicRef)}`;

  return (
    <ConfirmationShell>
      <header className="border-b border-neutral-300">
        <Container className="flex items-center justify-between py-5 md:py-6">
          <Link
            href="/"
            className="text-caption font-medium tracking-[0.28em] text-ink transition-opacity hover:opacity-70"
          >
            SAAN
          </Link>
          <Link
            href="/account/orders"
            className="text-caption uppercase tracking-[0.14em] text-neutral-600 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Order history
          </Link>
        </Container>
      </header>

      <Container className="py-14 md:py-20 lg:py-24">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
            <p className="text-caption uppercase tracking-[0.18em] text-neutral-500">
              {isPaid ? 'Confirmed' : 'Received'}
            </p>
          </div>

          <h1 className="mt-5 max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-[-0.03em] text-ink">
            {isPaid ? 'Thank you for your order' : 'Your order is placed'}
          </h1>
          <p className="mt-5 max-w-xl text-body-l text-neutral-700">
            {isPaid
              ? 'Payment was successful. We will prepare your piece with care for dispatch.'
              : 'Your order is saved. Complete payment if it is still pending.'}
          </p>
          <p className="mt-3 text-body text-neutral-500">
            {formatShortOrderId(order.orderNumber)} · {formatAccountDate(order.createdAt)}
          </p>

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-14 xl:gap-20">
            <div className="space-y-12">
              <OrderLineItemsList order={order} />
              <OrderDeliveryAddress address={order.addressSnapshot} />
            </div>

            <div className="space-y-8 lg:sticky lg:top-10 lg:self-start">
              <OrderSummaryAside order={order} showAccountHint />
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <CtaButton href="/shop" className="w-full sm:flex-1 lg:w-full">
                  Continue shopping
                </CtaButton>
                <CtaButton
                  href={accountOrderHref}
                  variant="secondary"
                  className="w-full sm:flex-1 lg:w-full"
                >
                  View order details
                </CtaButton>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </ConfirmationShell>
  );
}
