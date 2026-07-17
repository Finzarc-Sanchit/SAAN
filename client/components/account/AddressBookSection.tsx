'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { AddAddressForm } from '@/components/account/AddAddressForm';
import { useAuth } from '@/components/providers/AuthProvider';
import { addressQueryKeys, listAddresses } from '@/lib/api/addresses';
import { Skeleton } from '@/components/ui/Skeleton';

function AddressLoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1].map((item) => (
        <div key={item} className="border border-neutral-300 p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-5 h-4 w-44" />
          <Skeleton className="mt-2 h-4 w-36" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AddressBookSection() {
  const { user } = useAuth();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const addressesQuery = useQuery({
    queryKey: addressQueryKeys.list(),
    queryFn: listAddresses,
  });
  const addresses = addressesQuery.data ?? [];

  return (
    <section
      id="addresses"
      aria-labelledby="addresses-heading"
      className="scroll-mt-28 border-t border-neutral-300 pt-6 sm:pt-8"
    >
      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] xl:gap-14">
        <div>
          <h2
            id="addresses-heading"
            className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-medium text-ink"
          >
            Addresses
          </h2>
          <p className="mt-3 max-w-sm text-body leading-relaxed text-neutral-700">
            Delivery addresses saved securely to your account.
          </p>
          {!isAddingAddress && (
            <button
              type="button"
              onClick={() => setIsAddingAddress(true)}
              className="mt-6 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 border border-ink px-4 text-ui text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
            >
              <Plus className="h-4 w-4" strokeWidth={1.25} aria-hidden />
              Add address
            </button>
          )}
        </div>

        <div className="space-y-6">
          {isAddingAddress && user && (
            <AddAddressForm
              initialFirstName={user.firstName}
              initialLastName={user.lastName}
              onCancel={() => setIsAddingAddress(false)}
              onSaved={() => setIsAddingAddress(false)}
            />
          )}

          {addressesQuery.isLoading ? (
            <AddressLoadingState />
          ) : addressesQuery.isError ? (
            <div className="border border-neutral-300 px-6 py-10">
              <p className="text-body text-ink">We could not load your addresses.</p>
              <button
                type="button"
                onClick={() => void addressesQuery.refetch()}
                className="mt-4 text-ui text-neutral-700 underline underline-offset-4 hover:text-ink"
              >
                Try again
              </button>
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center border border-dashed border-neutral-300 px-6 text-center">
              <MapPin className="h-5 w-5 text-neutral-500" strokeWidth={1.25} aria-hidden />
              <p className="mt-4 text-body-medium text-ink">No saved addresses</p>
              <p className="mt-2 max-w-sm text-body text-neutral-700">
                Add a delivery address to make checkout faster.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {addresses.map((address) => (
                <article
                  key={address.addressId}
                  className="relative min-h-0 border border-neutral-300 bg-paper p-5 sm:min-h-56 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-body-medium text-ink">
                      {address.firstName} {address.lastName}
                    </h3>
                    {address.isDefault && (
                      <span className="bg-ink px-2.5 py-1 text-[10px] tracking-[0.12em] text-paper uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <address className="mt-5 text-body leading-relaxed text-neutral-700 not-italic">
                    <span className="block">{address.address}</span>
                    {address.apartment && (
                      <span className="block">{address.apartment}</span>
                    )}
                    <span className="block">
                      {address.city}, {address.state} {address.postalCode}
                    </span>
                    <a
                      href={`tel:${address.phone.replace(/\s+/g, '')}`}
                      className="mt-4 inline-block text-ink underline decoration-neutral-300 underline-offset-4 hover:decoration-ink"
                    >
                      {address.phone}
                    </a>
                  </address>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
