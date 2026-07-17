'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { SaanLogo } from '@/components/layout/SaanLogo';
import { Container } from '@/components/ui/Container';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import { useWishlist } from '@/hooks/useWishlist';
import { addressQueryKeys, createAddress, listAddresses } from '@/lib/api/addresses';
import { addCartItem, clearCart } from '@/lib/api/cart';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import {
  cancelPendingOrder,
  initiatePayment,
  listMyOrders,
  placeOrder,
  verifyPayment,
} from '@/lib/api/orders';
import {
  advanceCheckoutStep,
  canAccessCheckoutStep,
  clearBuyNowItem,
  clearPendingOrderId,
  readBuyNowItem,
  readCheckoutAddressId,
  readHighestCheckoutStep,
  readPendingOrderId,
  writeCheckoutAddressId,
  writePendingOrderId,
} from '@/lib/checkout/buy-now-storage';
import { openRazorpayCheckout, normalizeRazorpayContact } from '@/lib/razorpay';
import { formatPrice } from '@/lib/site-content';
import type { Address } from '@/lib/types/address';
import type { BuyNowItem } from '@/lib/types/checkout';
import {
  checkoutAddressSchema,
  type CheckoutAddressValues,
} from '@/lib/types/checkout.schemas';
import { cn } from '@/lib/utils';

export type CheckoutStep = 'cart' | 'address' | 'payment';
const CHECKOUT_STEP_ORDER: CheckoutStep[] = ['cart', 'address', 'payment'];
const checkoutPath = (step: CheckoutStep) => `/checkout/${step}`;

const emptyAddress: CheckoutAddressValues = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
};

const inputClassName =
  'h-12 w-full border border-neutral-300 bg-paper px-4 text-body text-ink outline-none transition-colors placeholder:text-neutral-500 focus:border-ink';

export function CheckoutPage({ step }: { step: CheckoutStep }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, openLoginDialog } = useAuth();
  const { removeItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [item, setItem] = useState<BuyNowItem | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [createdAddress, setCreatedAddress] = useState<Address | null>(null);
  const [addressValues, setAddressValues] = useState<CheckoutAddressValues>(emptyAddress);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CheckoutAddressValues, string>>
  >({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addressesQuery = useQuery({
    queryKey: addressQueryKeys.list(),
    queryFn: listAddresses,
    enabled: isAuthenticated,
  });

  const addresses = useMemo(() => {
    const saved = addressesQuery.data ?? [];
    if (!createdAddress || saved.some((entry) => entry.addressId === createdAddress.addressId)) {
      return saved;
    }
    return [...saved, createdAddress];
  }, [addressesQuery.data, createdAddress]);

  const selectedAddress =
    addresses.find((address) => address.addressId === selectedAddressId) ?? null;

  useEffect(() => {
    const storedItem = readBuyNowItem();
    setItem(storedItem);
    setSelectedAddressId(readCheckoutAddressId());
    setPendingOrderId(readPendingOrderId());

    if (storedItem && !canAccessCheckoutStep(step)) {
      router.replace(checkoutPath(readHighestCheckoutStep()));
    }
    setReady(true);
  }, [router, step]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openLoginDialog('login');
    }
  }, [authLoading, isAuthenticated, openLoginDialog]);

  useEffect(() => {
    if (!user) return;
    setAddressValues((current) => ({
      ...current,
      firstName: current.firstName || user.firstName,
      lastName: current.lastName || user.lastName,
    }));
  }, [user]);

  useEffect(() => {
    if (addressesQuery.isLoading) return;

    if (addresses.length === 0) {
      setShowAddressForm(true);
      setSelectedAddressId(null);
      return;
    }

    if (!selectedAddressId) {
      const preferred = addresses.find((address) => address.isDefault) ?? addresses[0];
      const preferredId = preferred?.addressId ?? null;
      setSelectedAddressId(preferredId);
      if (preferredId) {
        writeCheckoutAddressId(preferredId);
      }
    }
  }, [addresses, addressesQuery.isLoading, selectedAddressId]);

  function updateField<K extends keyof CheckoutAddressValues>(
    key: K,
    value: CheckoutAddressValues[K],
  ) {
    setAddressValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function selectAddress(addressId: string) {
    setSelectedAddressId(addressId);
    writeCheckoutAddressId(addressId);
    setShowAddressForm(false);
    setSubmitError(null);
  }

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSavingAddress) return;

    const parsed = checkoutAddressSchema.safeParse(addressValues);
    if (!parsed.success) {
      const errors: Partial<Record<keyof CheckoutAddressValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          errors[field as keyof CheckoutAddressValues] = issue.message;
        }
      });
      setFieldErrors(errors);
      setSubmitError('Please complete the highlighted address fields.');
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSavingAddress(true);

    try {
      const saved = await createAddress({
        ...parsed.data,
        apartment: parsed.data.apartment?.trim() ? parsed.data.apartment : null,
      });
      setCreatedAddress(saved);
      setSelectedAddressId(saved.addressId);
      writeCheckoutAddressId(saved.addressId);
      setShowAddressForm(false);
      advanceCheckoutStep('payment');
      router.push(checkoutPath('payment'));
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setFieldErrors(
          getFieldErrors(error) as Partial<Record<keyof CheckoutAddressValues, string>>,
        );
        setSubmitError(getApiErrorMessage(error));
      } else {
        setSubmitError('We could not save this address. Please try again.');
      }
    } finally {
      setIsSavingAddress(false);
    }
  }

  function continueToPayment() {
    if (!selectedAddressId) {
      setSubmitError('Select a delivery address to continue.');
      return;
    }
    setSubmitError(null);
    advanceCheckoutStep('payment');
    router.push(checkoutPath('payment'));
  }

  function navigateToPreviousStep(target: CheckoutStep) {
    const currentIndex = CHECKOUT_STEP_ORDER.indexOf(step);
    const targetIndex = CHECKOUT_STEP_ORDER.indexOf(target);
    const stepsBack = currentIndex - targetIndex;

    if (stepsBack <= 0) {
      return;
    }

    setSubmitError(null);
    // Match browser Back: walk history instead of pushing a new step URL.
    window.history.go(-stepsBack);
  }

  async function releasePendingOrder(orderId: string | null) {
    if (!orderId) return;

    try {
      await cancelPendingOrder(orderId);
    } catch {
      // Order may already be cancelled or paid — still clear local reservation.
    }

    setPendingOrderId(null);
    clearPendingOrderId();
  }

  async function handlePay() {
    if (!item || !selectedAddress || isPaying) return;

    if (!isAuthenticated) {
      openLoginDialog('login');
      return;
    }

    setSubmitError(null);
    setIsPaying(true);

    let orderId: string | null = pendingOrderId;
    let paymentCompleted = false;

    try {
      if (!orderId) {
        const recentOrders = await listMyOrders({ limit: 10 });
        const reusable = recentOrders.find(
          (order) =>
            order.status === 'pending' &&
            order.paymentStatus === 'pending' &&
            order.items.some(
              (line) =>
                line.productId === item.productId &&
                line.sizeId === item.sizeId &&
                line.quantity === item.quantity,
            ),
        );

        if (reusable) {
          orderId = reusable.id;
          setPendingOrderId(reusable.id);
          writePendingOrderId(reusable.id);
        } else {
          // Build a server cart for this buy-now line only. Local cart stays
          // intact until payment succeeds so abandoned checkouts keep the item.
          await clearCart();
          await addCartItem({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
          });

          const order = await placeOrder({ addressId: selectedAddress.addressId });
          orderId = order.id;
          setPendingOrderId(order.id);
          writePendingOrderId(order.id);
        }
      }

      const payment = await initiatePayment(orderId);
      const checkoutResult = await openRazorpayCheckout({
        payment,
        name: 'SAAN',
        description: item.name,
        prefill: {
          name: `${selectedAddress.firstName} ${selectedAddress.lastName}`.trim(),
          email: user?.email,
          contact: normalizeRazorpayContact(selectedAddress.phone),
        },
      });

      if (checkoutResult.status === 'dismissed') {
        await releasePendingOrder(orderId);
        setSubmitError('Payment was cancelled. You can try again when ready.');
        return;
      }

      if (checkoutResult.status === 'failed') {
        await releasePendingOrder(orderId);
        setSubmitError(checkoutResult.message);
        return;
      }

      paymentCompleted = true;

      await verifyPayment(orderId, {
        razorpayOrderId: checkoutResult.response.razorpay_order_id,
        razorpayPaymentId: checkoutResult.response.razorpay_payment_id,
        razorpaySignature: checkoutResult.response.razorpay_signature,
      });

      removeItem(item.productId, item.sizeLabel);
      clearBuyNowItem();
      router.replace(`/order-confirmation/${orderId}`);
    } catch (error: unknown) {
      // Do not release stock after Razorpay reports a successful charge —
      // verification can be retried without creating a new reservation.
      if (orderId && !paymentCompleted) {
        await releasePendingOrder(orderId);
      }

      setSubmitError(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'We could not complete checkout. Please try again.',
      );
    } finally {
      setIsPaying(false);
    }
  }

  if (!ready || authLoading) {
    return <CheckoutLoading />;
  }

  if (!item) {
    return (
      <section className="bg-paper py-24">
        <Container className="max-w-xl text-center">
          <h1 className="text-h2 text-ink">Nothing to check out</h1>
          <p className="mt-4 text-body text-neutral-700">
            Choose a piece and select Buy Now to continue.
          </p>
          <CtaButton href="/shop" className="mt-8">
            Return to shop
          </CtaButton>
        </Container>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-paper py-24">
        <Container className="max-w-xl text-center">
          <h1 className="text-h2 text-ink">Sign in to continue</h1>
          <p className="mt-4 text-body text-neutral-700">
            Sign in to choose a delivery address and complete payment.
          </p>
          <CtaButton className="mt-8" onClick={() => openLoginDialog('login')}>
            Sign in
          </CtaButton>
        </Container>
      </section>
    );
  }

  const lineTotal = item.price * item.quantity;

  return (
    <section className="min-h-[70vh] bg-paper pb-20">
      <CheckoutProgress step={step} onStepChange={navigateToPreviousStep} />
      {step === 'cart' ? (
        <div className="bg-ink py-2 text-center text-[10px] uppercase tracking-[0.12em] text-paper">
          Prices are inclusive of all taxes
        </div>
      ) : null}

      <Container className="max-w-[1180px] pt-12 md:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)] lg:gap-16">
          <main>
            {step === 'cart' ? (
              <CartStep
                item={item}
                total={lineTotal}
                onRemove={() => {
                  clearBuyNowItem();
                  router.replace('/shop');
                }}
                onMoveToWishlist={() => {
                  if (!isWishlisted(item.productId)) {
                    toggleWishlist(item.productId);
                  }
                  clearBuyNowItem();
                  router.replace('/shop');
                }}
              />
            ) : addressesQuery.isLoading ? (
              <div className="flex min-h-64 items-center justify-center">
                <Spinner />
              </div>
            ) : addressesQuery.isError ? (
              <CheckoutError message="We could not load your addresses. Please refresh and try again." />
            ) : step === 'payment' && selectedAddress ? (
              <PaymentStep
                address={selectedAddress}
                isPaying={isPaying}
                error={submitError}
                onChangeAddress={() => {
                  if (!pendingOrderId) {
                    setSubmitError(null);
                    window.history.back();
                  }
                }}
                onPay={handlePay}
              />
            ) : showAddressForm || addresses.length === 0 ? (
              <AddressForm
                values={addressValues}
                errors={fieldErrors}
                isSaving={isSavingAddress}
                submitError={submitError}
                canCancel={addresses.length > 0}
                onChange={updateField}
                onCancel={() => {
                  setShowAddressForm(false);
                  setSubmitError(null);
                }}
                onSubmit={handleAddAddress}
              />
            ) : (
              <AddressSelection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                error={submitError}
                onSelect={selectAddress}
                onAddNew={() => {
                  setShowAddressForm(true);
                  setSubmitError(null);
                }}
                onContinue={continueToPayment}
              />
            )}
          </main>

          <OrderSummary
            item={item}
            total={lineTotal}
            showPlaceOrder={step === 'cart'}
            onPlaceOrder={() => {
              advanceCheckoutStep('address');
              router.push(checkoutPath('address'));
              setSubmitError(null);
            }}
          />
        </div>
        <p className="mt-14 border-t border-neutral-300 pt-5 text-[11px] leading-relaxed text-neutral-700">
          Orders are subject to availability. Duties and local taxes for international
          deliveries, where applicable, are payable by the recipient.
        </p>
      </Container>
    </section>
  );
}

function CheckoutProgress({
  step,
  onStepChange,
}: {
  step: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
}) {
  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(step);

  return (
    <div className="border-b border-neutral-300 bg-paper">
      <Container className="max-w-[1180px]">
        <div className="grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
          <SaanLogo />
          <nav aria-label="Checkout progress" className="flex items-center justify-center gap-2 sm:gap-5">
            <ProgressLabel
              number="1"
              label="Cart"
              active={step === 'cart'}
              accessible={currentIndex > 0}
              onClick={() => onStepChange('cart')}
            />
            <span className="w-5 border-t border-dashed border-neutral-500 sm:w-14" aria-hidden />
            <ProgressLabel
              number="2"
              label="Address"
              active={step === 'address'}
              accessible={currentIndex > 1}
              onClick={() => onStepChange('address')}
            />
            <span className="w-5 border-t border-dashed border-neutral-500 sm:w-14" aria-hidden />
            <ProgressLabel
              number="3"
              label="Payment"
              active={step === 'payment'}
              accessible={false}
              onClick={() => onStepChange('payment')}
            />
          </nav>
          <div className="hidden items-center gap-2 text-caption uppercase tracking-[0.16em] text-neutral-700 sm:flex">
            <ShieldCheck className="h-4 w-4 text-success" strokeWidth={1.5} />
            Secure
          </div>
        </div>
      </Container>
    </div>
  );
}

function ProgressLabel({
  number,
  label,
  active,
  accessible,
  onClick,
}: {
  number: string;
  label: string;
  active: boolean;
  accessible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!accessible}
      onClick={onClick}
      className={cn(
        'flex h-16 items-center gap-2 border-b-2 text-caption uppercase tracking-[0.14em]',
        active ? 'border-ink text-ink' : 'border-transparent text-neutral-500',
        accessible && 'cursor-pointer hover:text-ink',
        !accessible && !active && 'cursor-default',
      )}
      aria-current={active ? 'step' : undefined}
    >
      <span>{number}.</span>
      <span>{label}</span>
    </button>
  );
}

function CartStep({
  item,
  total,
  onRemove,
  onMoveToWishlist,
}: {
  item: BuyNowItem;
  total: number;
  onRemove: () => void;
  onMoveToWishlist: () => void;
}) {
  return (
    <section aria-labelledby="shopping-bag-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 id="shopping-bag-heading" className="text-h2 text-ink">
            My shopping bag
          </h1>
          <p className="mt-2 text-caption text-neutral-500">
            1 item
          </p>
        </div>
        <p className="text-body-medium text-ink">
          Total: {formatPrice(total, item.currency)}
        </p>
      </div>

      <article className="mt-8 border border-neutral-300">
        <div className="flex gap-5 p-4 sm:p-5">
          <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-neutral-100 sm:w-32">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="128px"
              className="object-cover object-center"
            />
          </div>
          <div className="flex min-w-0 flex-1 justify-between gap-5">
            <div>
              <h2 className="text-body-medium text-ink">{item.name}</h2>
              <p className="mt-2 text-caption text-neutral-700">
                Size: {item.sizeLabel}
              </p>
              <p className="mt-1 text-caption text-neutral-700">
                Quantity: {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-body-medium text-ink">
              {formatPrice(total, item.currency)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-neutral-300">
          <button
            type="button"
            onClick={onRemove}
            className="h-11 border-r border-neutral-300 px-4 text-caption uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:text-ink"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onMoveToWishlist}
            className="h-11 px-4 text-caption uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:text-ink"
          >
            Move to wishlist
          </button>
        </div>
      </article>
    </section>
  );
}

function AddressSelection({
  addresses,
  selectedAddressId,
  error,
  onSelect,
  onAddNew,
  onContinue,
}: {
  addresses: Address[];
  selectedAddressId: string | null;
  error: string | null;
  onSelect: (addressId: string) => void;
  onAddNew: () => void;
  onContinue: () => void;
}) {
  return (
    <section aria-labelledby="delivery-address-heading">
      <h1 id="delivery-address-heading" className="text-h2 text-ink">
        Select delivery address
      </h1>
      <p className="mt-3 text-body text-neutral-700">
        Choose where you would like your order delivered.
      </p>

      <div className="mt-8 space-y-4">
        {addresses.map((address) => {
          const selected = address.addressId === selectedAddressId;
          return (
            <label
              key={address.addressId}
              className={cn(
                'flex cursor-pointer gap-4 border p-5 transition-colors md:p-6',
                selected ? 'border-ink' : 'border-neutral-300 hover:border-neutral-500',
              )}
            >
              <input
                type="radio"
                name="delivery-address"
                value={address.addressId}
                checked={selected}
                onChange={() => onSelect(address.addressId)}
                className="mt-1 h-4 w-4 accent-ink"
              />
              <AddressCopy address={address} />
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAddNew}
          className="h-12 border border-neutral-500 px-6 text-ui text-ink transition-colors hover:border-ink"
        >
          Add another address
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="h-12 bg-ink px-10 text-ui text-paper transition-opacity hover:opacity-80"
        >
          Continue
        </button>
      </div>

      {error ? <ErrorMessage message={error} /> : null}
    </section>
  );
}

function AddressForm({
  values,
  errors,
  isSaving,
  submitError,
  canCancel,
  onChange,
  onCancel,
  onSubmit,
}: {
  values: CheckoutAddressValues;
  errors: Partial<Record<keyof CheckoutAddressValues, string>>;
  isSaving: boolean;
  submitError: string | null;
  canCancel: boolean;
  onChange: <K extends keyof CheckoutAddressValues>(
    key: K,
    value: CheckoutAddressValues[K],
  ) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section aria-labelledby="new-address-heading">
      <h1 id="new-address-heading" className="text-h2 text-ink">
        Add delivery address
      </h1>
      <p className="mt-3 text-body text-neutral-700">
        Enter the address where you would like your order delivered.
      </p>

      <form onSubmit={onSubmit} className="mt-8 border border-neutral-300 p-5 md:p-7" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First name"
            value={values.firstName}
            error={errors.firstName}
            onChange={(value) => onChange('firstName', value)}
          />
          <Field
            id="lastName"
            label="Last name"
            value={values.lastName}
            error={errors.lastName}
            onChange={(value) => onChange('lastName', value)}
          />
          <Field
            id="phone"
            label="Mobile number"
            value={values.phone}
            error={errors.phone}
            onChange={(value) => onChange('phone', value)}
            inputMode="tel"
            className="sm:col-span-2"
          />
          <Field
            id="postalCode"
            label="Postal code"
            value={values.postalCode}
            error={errors.postalCode}
            onChange={(value) => onChange('postalCode', value)}
            inputMode="text"
            className="sm:col-span-2"
          />
          <Field
            id="address"
            label="Address"
            value={values.address}
            error={errors.address}
            onChange={(value) => onChange('address', value)}
            className="sm:col-span-2"
          />
          <Field
            id="apartment"
            label="Apartment / suite (optional)"
            value={values.apartment ?? ''}
            error={errors.apartment}
            onChange={(value) => onChange('apartment', value)}
            className="sm:col-span-2"
          />
          <Field
            id="city"
            label="City / district"
            value={values.city}
            error={errors.city}
            onChange={(value) => onChange('city', value)}
          />
          <Field
            id="state"
            label="State"
            value={values.state}
            error={errors.state}
            onChange={(value) => onChange('state', value)}
          />
        </div>

        {submitError ? <ErrorMessage message={submitError} /> : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="h-12 border border-neutral-500 px-6 text-ui text-ink"
            >
              Back
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 flex-1 bg-ink px-8 text-ui text-paper transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Add address'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PaymentStep({
  address,
  isPaying,
  error,
  onChangeAddress,
  onPay,
}: {
  address: Address;
  isPaying: boolean;
  error: string | null;
  onChangeAddress: () => void;
  onPay: () => void;
}) {
  return (
    <section aria-labelledby="payment-heading" className="space-y-5">
      <h1 id="payment-heading" className="sr-only">
        Payment
      </h1>

      <div className="border border-neutral-300">
        <SectionBar title="Delivery address" />
        <div className="p-5 md:p-6">
          <AddressCopy address={address} />
          <button
            type="button"
            onClick={onChangeAddress}
            className="mt-4 text-caption uppercase tracking-[0.1em] text-neutral-700 underline-offset-4 hover:text-ink hover:underline"
          >
            Change address
          </button>
        </div>
      </div>

      <div className="border border-neutral-300">
        <SectionBar title="Payment method" />
        <div className="p-5 md:p-6">
          <div className="border border-ink px-5 py-4">
            <p className="text-body-medium text-ink">Razorpay secure checkout</p>
            <p className="mt-1 text-caption text-neutral-700">
              Pay using UPI, debit or credit card, netbanking, or a supported wallet.
            </p>
          </div>

          {error ? <ErrorMessage message={error} /> : null}

          <button
            type="button"
            onClick={onPay}
            disabled={isPaying}
            className="mt-6 h-12 w-full bg-ink px-8 text-ui text-paper transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPaying ? 'Opening secure payment…' : 'Continue to Razorpay'}
          </button>
          <p className="mt-3 text-center text-caption text-neutral-500">
            Payment details are entered securely in Razorpay.
          </p>
        </div>
      </div>
    </section>
  );
}

function SectionBar({ title }: { title: string }) {
  return (
    <div className="flex items-center bg-neutral-100">
      <span className="h-10 w-1.5 bg-ink" aria-hidden />
      <h2 className="px-4 text-ui uppercase tracking-[0.12em] text-ink">{title}</h2>
    </div>
  );
}

function AddressCopy({ address }: { address: Address }) {
  return (
    <div className="min-w-0 text-body text-neutral-700">
      <p className="text-body-medium text-ink">
        {address.firstName} {address.lastName}
      </p>
      <p className="mt-2">
        {address.address}
        {address.apartment ? `, ${address.apartment}` : ''}
      </p>
      <p>
        {address.city}, {address.state} — {address.postalCode}
      </p>
      <p className="mt-2">Mobile: {address.phone}</p>
    </div>
  );
}

function OrderSummary({
  item,
  total,
  showPlaceOrder,
  onPlaceOrder,
}: {
  item: BuyNowItem;
  total: number;
  showPlaceOrder: boolean;
  onPlaceOrder: () => void;
}) {
  const bagTotal = (item.mrp ?? item.price) * item.quantity;
  const bagDiscount = Math.max(0, bagTotal - total);

  return (
    <aside className="h-fit border-l border-neutral-300 pl-0 lg:sticky lg:top-28 lg:pl-8">
      <p className="text-caption uppercase tracking-[0.14em] text-neutral-500">
        Price details (1 item)
      </p>
      <div className="mt-5 space-y-3 text-body">
        <div className="flex justify-between gap-4 text-neutral-700">
          <span>Bag total</span>
          <span>{formatPrice(bagTotal, item.currency)}</span>
        </div>
        <div className="flex justify-between gap-4 text-neutral-700">
          <span>Bag discount</span>
          <span className="text-[#03A685]">
            −{formatPrice(bagDiscount, item.currency)}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-neutral-700">
          <span>Order total</span>
          <span>{formatPrice(total, item.currency)}</span>
        </div>
        <div className="flex justify-between gap-4 text-neutral-700">
          <span>Delivery charges</span>
          <span className="text-[#03A685]">Free</span>
        </div>
        <div className="border-t border-neutral-300 pt-4">
          <div className="flex justify-between gap-4 text-body-medium text-ink">
            <span>Total</span>
            <span>{formatPrice(total, item.currency)}</span>
          </div>
        </div>
      </div>
      {showPlaceOrder ? (
        <button
          type="button"
          onClick={onPlaceOrder}
          className="mt-7 h-12 w-full bg-ink px-8 text-ui text-paper transition-opacity hover:opacity-80"
        >
          Place order
        </button>
      ) : null}
    </aside>
  );
}

function CheckoutLoading() {
  return (
    <section className="flex min-h-[50vh] items-center justify-center bg-paper py-24">
      <Spinner />
    </section>
  );
}

function CheckoutError({ message }: { message: string }) {
  return (
    <div className="border border-error/30 p-6">
      <p className="text-body text-error" role="alert">
        {message}
      </p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="mt-4 text-caption text-error" role="alert">
      {message}
    </p>
  );
}

type FieldProps = {
  id: keyof CheckoutAddressValues;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
};

function Field({
  id,
  label,
  value,
  error,
  onChange,
  inputMode,
  className,
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-caption uppercase tracking-[0.12em] text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClassName, error && 'border-error')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-caption text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
