'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import {
  createAppointment,
  getAppointmentAvailability,
} from '@/lib/api/appointments';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import { APPOINTMENT_COPY } from '@/lib/site-content';
import {
  appointmentFormSchema,
  type Appointment,
  type AppointmentFormValues,
  type DayAvailability,
  type PublicAppointmentSettings,
  type SlotUnavailableReason,
} from '@/lib/types/appointment.schemas';
import { cn } from '@/lib/utils';

const fieldClassName =
  'w-full border-b border-neutral-500 bg-transparent py-3 text-body text-ink placeholder:text-neutral-500 focus:border-ink focus:outline-none';

const initialValues: AppointmentFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  appointmentDate: '',
  timeSlot: '',
  appointmentType: '',
  notes: '',
};

function slotUnavailableLabel(reason?: SlotUnavailableReason): string {
  if (reason === 'booked') return 'Booked';
  return 'Unavailable';
}

function formatDisplayTime(time: string): string {
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = minuteRaw ?? '00';
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

function formatDisplayDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type AppointmentFormProps = {
  settings: PublicAppointmentSettings | null;
  contextError?: string | null;
  isContextLoading?: boolean;
};

export function AppointmentForm({
  settings,
  contextError = null,
  isContextLoading = false,
}: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AppointmentFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const appointmentTypes = useMemo(
    () => settings?.appointmentTypes.filter((type) => type.isActive) ?? [],
    [settings],
  );

  const createdTypeLabel = useMemo(() => {
    if (!createdAppointment) return '';
    const match = appointmentTypes.find(
      (type) => type.id === createdAppointment.appointmentType,
    );
    return match?.label ?? createdAppointment.appointmentType;
  }, [appointmentTypes, createdAppointment]);

  useEffect(() => {
    if (!values.appointmentType && appointmentTypes.length === 1) {
      const only = appointmentTypes[0];
      if (only) {
        setValues((prev) => ({ ...prev, appointmentType: only.id }));
      }
    }
  }, [appointmentTypes, values.appointmentType]);

  useEffect(() => {
    const date = values.appointmentDate;
    if (!date) {
      setAvailability(null);
      setAvailabilityError(null);
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setIsLoadingAvailability(true);
      setAvailabilityError(null);
      setValues((prev) => ({ ...prev, timeSlot: '' }));

      try {
        const result = await getAppointmentAvailability(date);
        if (!cancelled) {
          setAvailability(result);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setAvailability(null);
          setAvailabilityError(
            error instanceof ApiError
              ? getApiErrorMessage(error)
              : 'We could not load times for this date.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [values.appointmentDate]);

  function updateField<K extends keyof AppointmentFormValues>(
    key: K,
    value: AppointmentFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    const parsed = appointmentFormSchema.safeParse({
      ...values,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
    });

    if (!parsed.success) {
      const errors: Partial<Record<keyof AppointmentFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          errors[field as keyof AppointmentFormValues] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const appointment = await createAppointment({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        appointmentDate: parsed.data.appointmentDate,
        timeSlot: parsed.data.timeSlot,
        appointmentType: parsed.data.appointmentType,
        notes: parsed.data.notes,
      });
      setCreatedAppointment(appointment);
      setValues(initialValues);
      setAvailability(null);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const serverFieldErrors = getFieldErrors(error);
        setFieldErrors(
          serverFieldErrors as Partial<Record<keyof AppointmentFormValues, string>>,
        );
        setSubmitError(getApiErrorMessage(error));
      } else {
        setSubmitError('We could not send your request. Please try again shortly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdAppointment) {
    return (
      <div
        className="space-y-8 border border-neutral-300 bg-paper px-6 py-10 md:px-10"
        role="status"
      >
        <div>
          <p className="text-ui text-neutral-500">{APPOINTMENT_COPY.success.referenceLabel}</p>
          <p className="text-h3 mt-2 text-ink">{createdAppointment.referenceCode}</p>
          <h3 className="text-display-l mt-6 text-ink">{APPOINTMENT_COPY.success.title}</h3>
          <p className="text-body-l mt-4 max-w-md text-neutral-700">
            {APPOINTMENT_COPY.success.body}
          </p>
        </div>

        <dl className="space-y-4 border-t border-neutral-300 pt-6">
          <p className="text-ui text-neutral-500">{APPOINTMENT_COPY.success.summaryLabel}</p>
          <div>
            <dt className="sr-only">Date</dt>
            <dd className="text-body text-ink">
              {formatDisplayDate(createdAppointment.appointmentDate)}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Time</dt>
            <dd className="text-body text-ink">
              {formatDisplayTime(createdAppointment.timeSlot)}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Type</dt>
            <dd className="text-body text-ink">{createdTypeLabel}</dd>
          </div>
        </dl>

        <CtaButton href={APPOINTMENT_COPY.success.ctaHref} className="min-w-[12rem]">
          {APPOINTMENT_COPY.success.ctaLabel}
        </CtaButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {(isContextLoading || contextError) && (
        <div className="space-y-2">
          {isContextLoading && (
            <p className="text-body text-neutral-700" role="status">
              Loading appointment options…
            </p>
          )}
          {contextError && (
            <p className="text-body text-error" role="alert">
              {contextError}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FormField
          id="appointment-first-name"
          label={APPOINTMENT_COPY.form.firstName}
          value={values.firstName}
          onChange={(value) => updateField('firstName', value)}
          error={fieldErrors.firstName}
          autoComplete="given-name"
          disabled={isSubmitting}
          maxLength={80}
        />
        <FormField
          id="appointment-last-name"
          label={APPOINTMENT_COPY.form.lastName}
          value={values.lastName}
          onChange={(value) => updateField('lastName', value)}
          error={fieldErrors.lastName}
          autoComplete="family-name"
          disabled={isSubmitting}
          maxLength={80}
        />
        <FormField
          id="appointment-email"
          label={APPOINTMENT_COPY.form.email}
          type="email"
          value={values.email}
          onChange={(value) => updateField('email', value)}
          error={fieldErrors.email}
          autoComplete="email"
          disabled={isSubmitting}
          maxLength={254}
        />
        <FormField
          id="appointment-phone"
          label={APPOINTMENT_COPY.form.phone}
          type="tel"
          value={values.phone}
          onChange={(value) => updateField('phone', value)}
          error={fieldErrors.phone}
          autoComplete="tel"
          disabled={isSubmitting}
          maxLength={20}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="appointment-type" className="text-ui mb-2 block text-ink">
            {APPOINTMENT_COPY.form.appointmentType}
          </label>
          <select
            id="appointment-type"
            value={values.appointmentType}
            onChange={(event) => updateField('appointmentType', event.target.value)}
            disabled={isSubmitting || appointmentTypes.length === 0}
            aria-invalid={Boolean(fieldErrors.appointmentType)}
            aria-describedby={
              fieldErrors.appointmentType ? 'appointment-type-error' : undefined
            }
            className={cn(
              fieldClassName,
              'appearance-none',
              fieldErrors.appointmentType && 'border-error',
            )}
          >
            <option value="">Select a type</option>
            {appointmentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          {fieldErrors.appointmentType && (
            <p id="appointment-type-error" className="text-caption mt-2 text-error" role="alert">
              {fieldErrors.appointmentType}
            </p>
          )}
        </div>

        <FormField
          id="appointment-date"
          label={APPOINTMENT_COPY.form.appointmentDate}
          type="date"
          value={values.appointmentDate}
          onChange={(value) => updateField('appointmentDate', value)}
          error={fieldErrors.appointmentDate}
          disabled={isSubmitting}
          min={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div>
        <p id="appointment-time-label" className="text-ui mb-3 block text-ink">
          {APPOINTMENT_COPY.form.timeSlot}
        </p>

        {!values.appointmentDate && (
          <p className="text-body text-neutral-700">{APPOINTMENT_COPY.form.selectingSlot}</p>
        )}

        {values.appointmentDate && isLoadingAvailability && (
          <p className="text-body flex items-center gap-2 text-neutral-700" role="status">
            <Spinner />
            {APPOINTMENT_COPY.form.loadingSlots}
          </p>
        )}

        {availabilityError && (
          <p className="text-body text-error" role="alert">
            {availabilityError}
          </p>
        )}

        {availability && !availability.isOpen && availability.slots.length === 0 && (
          <p className="text-body text-neutral-700">{APPOINTMENT_COPY.form.closedDay}</p>
        )}

        {availability && !availability.isOpen && availability.slots.length > 0 && (
          <p className="text-body mb-3 text-neutral-700">{APPOINTMENT_COPY.form.slotsUnavailable}</p>
        )}

        {availability && availability.isOpen && availability.slots.length === 0 && (
          <p className="text-body text-neutral-700">{APPOINTMENT_COPY.form.slotsUnavailable}</p>
        )}

        {availability && availability.slots.length > 0 && (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            role="group"
            aria-labelledby="appointment-time-label"
          >
            {availability.slots.map((slot) => {
              const isSelected = values.timeSlot === slot.time;
              const isDisabled = !slot.available || isSubmitting;

              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={isDisabled}
                  tabIndex={isDisabled ? -1 : undefined}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) updateField('timeSlot', slot.time);
                  }}
                  className={cn(
                    'border px-3 py-3 text-left transition-colors duration-300',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                    slot.available
                      ? isSelected
                        ? 'border-ink bg-ink text-paper'
                        : 'border-neutral-400 text-ink hover:border-ink'
                      : 'cursor-not-allowed border-neutral-300 text-neutral-500 opacity-45',
                  )}
                >
                  <span className="text-ui block tracking-[0.08em]">
                    {formatDisplayTime(slot.time)}
                  </span>
                  {!slot.available && (
                    <span className="text-caption mt-1 block">
                      {slotUnavailableLabel(slot.reason)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {fieldErrors.timeSlot && (
          <p id="appointment-time-error" className="text-caption mt-2 text-error" role="alert">
            {fieldErrors.timeSlot}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="appointment-notes" className="text-ui mb-2 block text-ink">
          {APPOINTMENT_COPY.form.notes}
        </label>
        <textarea
          id="appointment-notes"
          rows={5}
          value={values.notes ?? ''}
          onChange={(event) => updateField('notes', event.target.value)}
          disabled={isSubmitting}
          maxLength={5000}
          aria-invalid={Boolean(fieldErrors.notes)}
          aria-describedby={fieldErrors.notes ? 'appointment-notes-error' : undefined}
          className={cn(
            'w-full resize-y border border-neutral-400 bg-transparent px-4 py-3 text-body text-ink',
            'placeholder:text-neutral-500 focus:border-ink focus:outline-none',
            fieldErrors.notes && 'border-error',
          )}
        />
        {fieldErrors.notes && (
          <p id="appointment-notes-error" className="text-caption mt-2 text-error" role="alert">
            {fieldErrors.notes}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-body text-error" role="alert">
          {submitError}
        </p>
      )}

      <CtaButton
        type="submit"
        disabled={isSubmitting || isContextLoading || Boolean(contextError)}
        className="min-w-[12rem] gap-2"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            Sending
          </>
        ) : (
          APPOINTMENT_COPY.form.submitLabel
        )}
      </CtaButton>
    </form>
  );
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  disabled,
  maxLength,
  min,
  max,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-ui mb-2 block text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldClassName, error && 'border-error')}
      />
      {error && (
        <p id={`${id}-error`} className="text-caption mt-2 text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
