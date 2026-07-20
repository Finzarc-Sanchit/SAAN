import type { OrderAddressSnapshot } from '@/lib/types/order';

type OrderDeliveryAddressProps = {
  address: OrderAddressSnapshot;
  headingId?: string;
};

export function OrderDeliveryAddress({
  address,
  headingId = 'delivery-heading',
}: OrderDeliveryAddressProps) {
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-caption uppercase tracking-[0.18em] text-neutral-500"
      >
        Delivery
      </h2>
      <address className="mt-5 not-italic text-body leading-relaxed text-neutral-700">
        <p className="text-body-medium text-ink">
          {address.firstName} {address.lastName}
        </p>
        <p className="mt-2">{address.address}</p>
        {address.apartment ? <p>{address.apartment}</p> : null}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="mt-2 text-neutral-500">{address.phone}</p>
      </address>
    </section>
  );
}
