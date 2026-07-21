'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { AddAddressForm } from '@/components/account/AddAddressForm';
import { useAuth } from '@/components/providers/AuthProvider';
import { addressQueryKeys, listAddresses } from '@/lib/api/addresses';
import { ACCOUNT_CONTENT_PADDING } from '@/lib/account-ui';
import { Skeleton } from '@/components/ui/Skeleton';

function AddressLoadingState() {
  return (
    <div className="space-y-4">
      {[0, 1].map((item) => (
        <div key={item} className="border border-neutral-200 bg-paper p-5 sm:p-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-4 h-4 w-48" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-10/12" />
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
      className={`scroll-mt-28 ${ACCOUNT_CONTENT_PADDING}`}
    >
      <div className="border-b border-neutral-200 pb-5 sm:pb-6">
        <h2 id="addresses-heading" className="text-[1.375rem] font-medium text-ink sm:text-[1.5rem]">
          Manage Addresses
        </h2>
      </div>

      {!isAddingAddress && (
        <button
          type="button"
          onClick={() => setIsAddingAddress(true)}
          className="mt-5 inline-flex min-h-11 w-full items-center gap-3 border border-neutral-200 px-4 text-left text-ui font-medium uppercase tracking-[0.08em] text-[#2874f0] transition-colors hover:bg-[#f7faff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2874f0]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Add a new address
        </button>
      )}

      <div className="mt-5 space-y-4">
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
          <div className="border border-neutral-200 px-6 py-10">
            <p className="text-body text-ink">We could not load your addresses.</p>
            <button
              type="button"
              onClick={() => void addressesQuery.refetch()}
              className="mt-4 text-ui text-[#2874f0] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center border border-dashed border-neutral-200 px-6 text-center">
            <MapPin className="h-5 w-5 text-neutral-500" strokeWidth={1.25} aria-hidden />
            <p className="mt-4 text-body-medium text-ink">No saved addresses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <article
                key={address.addressId}
                className="border border-neutral-200 bg-paper p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {address.isDefault ? (
                      <span className="inline-flex bg-neutral-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-600">
                        Default
                      </span>
                    ) : null}
                    <div className="mt-3 flex flex-col gap-1 text-sm text-ink sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      <h3 className="font-medium text-ink">
                        {address.firstName} {address.lastName}
                      </h3>
                      <a
                        href={`tel:${address.phone.replace(/\s+/g, '')}`}
                        className="font-medium text-ink"
                      >
                        {address.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <address className="mt-4 text-sm leading-7 text-neutral-700 not-italic">
                  <span>{address.address}</span>
                  {address.apartment ? <span>, {address.apartment}</span> : null}
                  <span>, {address.city}</span>
                  <span>, {address.state}</span>
                  <span> - {address.postalCode}</span>
                </address>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
