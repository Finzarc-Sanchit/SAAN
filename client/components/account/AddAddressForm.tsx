'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addressQueryKeys, createAddress } from '@/lib/api/addresses';
import {
  ApiError,
  getApiErrorMessage,
  getFieldErrors,
} from '@/lib/api/errors';
import {
  checkoutAddressSchema,
  type CheckoutAddressValues,
} from '@/lib/types/checkout.schemas';

type AddAddressFormProps = {
  initialFirstName: string;
  initialLastName: string;
  onCancel: () => void;
  onSaved: () => void;
};

const inputClassName =
  'mt-2 h-12 w-full border border-neutral-300 bg-paper px-4 text-body text-ink outline-none transition-colors placeholder:text-neutral-500 focus:border-ink';

export function AddAddressForm({
  initialFirstName,
  initialLastName,
  onCancel,
  onSaved,
}: AddAddressFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CheckoutAddressValues>({
    firstName: initialFirstName,
    lastName: initialLastName,
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutAddressValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof CheckoutAddressValues>(
    field: K,
    value: CheckoutAddressValues[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = checkoutAddressSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CheckoutAddressValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          fieldErrors[field as keyof CheckoutAddressValues] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitError('Please complete the highlighted fields.');
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSaving(true);

    try {
      await createAddress({
        ...parsed.data,
        apartment: parsed.data.apartment?.trim() || null,
        isDefault,
      });
      await queryClient.invalidateQueries({ queryKey: addressQueryKeys.all });
      onSaved();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(
          getFieldErrors(error) as Partial<
            Record<keyof CheckoutAddressValues, string>
          >,
        );
        setSubmitError(getApiErrorMessage(error));
      } else {
        setSubmitError('We could not save this address. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="min-w-0 border border-neutral-300 bg-neutral-100 p-4 sm:p-6 lg:p-7"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div>
          <h3 className="text-h3 text-ink">Add an address</h3>
          <p className="mt-2 text-body text-neutral-700">
            Save a delivery address for future orders.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="self-start text-ui text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-ink"
        >
          Cancel
        </button>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <AddressField
          label="First name"
          value={form.firstName}
          error={errors.firstName}
          autoComplete="given-name"
          onChange={(value) => updateField('firstName', value)}
        />
        <AddressField
          label="Last name"
          value={form.lastName}
          error={errors.lastName}
          autoComplete="family-name"
          onChange={(value) => updateField('lastName', value)}
        />
        <AddressField
          label="Mobile number"
          value={form.phone}
          error={errors.phone}
          type="tel"
          autoComplete="tel"
          onChange={(value) => updateField('phone', value)}
        />
        <AddressField
          label="Postal code"
          value={form.postalCode}
          error={errors.postalCode}
          autoComplete="postal-code"
          onChange={(value) => updateField('postalCode', value)}
        />
      </div>

      <div className="mt-5 space-y-5">
        <AddressField
          label="Address"
          value={form.address}
          error={errors.address}
          autoComplete="street-address"
          onChange={(value) => updateField('address', value)}
        />
        <AddressField
          label="Apartment, suite, etc. (optional)"
          value={form.apartment ?? ''}
          error={errors.apartment}
          autoComplete="address-line2"
          onChange={(value) => updateField('apartment', value)}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <AddressField
          label="City"
          value={form.city}
          error={errors.city}
          autoComplete="address-level2"
          onChange={(value) => updateField('city', value)}
        />
        <AddressField
          label="State"
          value={form.state}
          error={errors.state}
          autoComplete="address-level1"
          onChange={(value) => updateField('state', value)}
        />
      </div>

      <label className="mt-6 flex cursor-pointer items-center gap-3 text-body text-neutral-700">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
          className="h-4 w-4 accent-ink"
        />
        Use as my default delivery address
      </label>

      {submitError && (
        <p role="alert" className="mt-5 text-body text-red-700">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-7 inline-flex min-h-11 w-full items-center justify-center bg-ink px-6 text-ui text-paper transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isSaving ? 'Saving address…' : 'Save address'}
      </button>
    </form>
  );
}

type AddressFieldProps = {
  label: string;
  value: string;
  error?: string;
  type?: 'text' | 'tel';
  autoComplete?: string;
  onChange: (value: string) => void;
};

function AddressField({
  label,
  value,
  error,
  type = 'text',
  autoComplete,
  onChange,
}: AddressFieldProps) {
  const id = `address-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const errorId = `${id}-error`;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-ui text-neutral-700">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClassName}
      />
      {error && (
        <span id={errorId} className="mt-1.5 block text-caption text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
