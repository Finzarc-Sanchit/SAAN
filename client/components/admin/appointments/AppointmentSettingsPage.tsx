'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import { AdminFormField, adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import {
  appointmentsQueryKeys,
  getAdminAppointmentSettings,
  updateAdminAppointmentSettings,
} from '@/lib/api/appointments';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  WEEKDAY_LABELS,
  type AppointmentSettings,
  type AppointmentTypeConfig,
  type SpecialOpeningDay,
  type TemporaryClosure,
  type Weekday,
} from '@/lib/types/appointment.schemas';
import { cn } from '@/lib/utils';

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const satisfies readonly Weekday[];

type SettingsFormState = {
  workingDays: Weekday[];
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  maxAppointmentsPerDay: number;
  timezone: string;
  studioAddressText: string;
  contactPhone: string;
  contactEmail: string;
  cancellationPolicy: string;
  guidelinesText: string;
  holidaysText: string;
  temporaryClosures: TemporaryClosure[];
  specialOpeningDays: SpecialOpeningDay[];
  appointmentTypes: AppointmentTypeConfig[];
};

function settingsToForm(settings: AppointmentSettings): SettingsFormState {
  return {
    workingDays: [...settings.workingDays],
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    slotDurationMinutes: settings.slotDurationMinutes,
    bufferMinutes: settings.bufferMinutes,
    maxAppointmentsPerDay: settings.maxAppointmentsPerDay,
    timezone: settings.timezone,
    studioAddressText: settings.studioAddressLines.join('\n'),
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    cancellationPolicy: settings.cancellationPolicy,
    guidelinesText: settings.guidelines.join('\n'),
    holidaysText: settings.holidays.join('\n'),
    temporaryClosures: settings.temporaryClosures.map((item) => ({ ...item })),
    specialOpeningDays: settings.specialOpeningDays.map((item) => ({ ...item })),
    appointmentTypes: settings.appointmentTypes.map((item) => ({ ...item })),
  };
}

function linesFromText(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugifyTypeId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

export function AppointmentSettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [form, setForm] = useState<SettingsFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: appointmentsQueryKeys.admin.settings(),
    queryFn: getAdminAppointmentSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsToForm(settingsQuery.data));
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateAdminAppointmentSettings,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.admin.settings() });
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.context() });
      setForm(settingsToForm(data));
      toast('Appointment settings saved');
      setFormError(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Could not save appointment settings',
        'error',
      );
    },
  });

  function updateForm<K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleWorkingDay(day: Weekday) {
    if (!form) return;
    const exists = form.workingDays.includes(day);
    const next = exists
      ? form.workingDays.filter((item) => item !== day)
      : [...form.workingDays, day].sort((a, b) => a - b);
    updateForm('workingDays', next as Weekday[]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || saveMutation.isPending) return;

    const studioAddressLines = linesFromText(form.studioAddressText);
    const guidelines = linesFromText(form.guidelinesText);
    const holidays = linesFromText(form.holidaysText);

    if (form.workingDays.length === 0) {
      setFormError('Select at least one working day.');
      return;
    }
    if (studioAddressLines.length === 0) {
      setFormError('Add at least one studio address line.');
      return;
    }
    if (form.appointmentTypes.length === 0) {
      setFormError('Add at least one appointment type.');
      return;
    }
    if (form.appointmentTypes.some((type) => !type.id.trim() || !type.label.trim())) {
      setFormError('Each appointment type needs an id and label.');
      return;
    }

    setFormError(null);
    saveMutation.mutate({
      workingDays: form.workingDays,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      slotDurationMinutes: form.slotDurationMinutes,
      bufferMinutes: form.bufferMinutes,
      maxAppointmentsPerDay: form.maxAppointmentsPerDay,
      timezone: form.timezone,
      studioAddressLines,
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      cancellationPolicy: form.cancellationPolicy.trim(),
      guidelines,
      holidays,
      temporaryClosures: form.temporaryClosures.filter((item) => item.date),
      specialOpeningDays: form.specialOpeningDays.filter(
        (item) => item.date && item.openingTime && item.closingTime,
      ),
      appointmentTypes: form.appointmentTypes,
    });
  }

  if (settingsQuery.isLoading && !form) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Header />
        <AdminCard>
          <div className="space-y-3" aria-label="Loading appointment settings">
            <AdminSkeleton className="h-5 w-1/3" />
            <AdminSkeleton className="h-10 w-full" />
            <AdminSkeleton className="h-10 w-full" />
            <AdminSkeleton className="h-24 w-full" />
          </div>
        </AdminCard>
      </div>
    );
  }

  if (settingsQuery.isError && !form) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Header />
        <AdminCard>
          <AdminInlineError
            message={
              settingsQuery.error instanceof ApiError
                ? getApiErrorMessage(settingsQuery.error)
                : 'Could not load appointment settings'
            }
            onRetry={() => void settingsQuery.refetch()}
          />
        </AdminCard>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-4 lg:space-y-6">
      <Header />

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6" noValidate>
        <AdminCard>
          <h2 className="font-display text-xl text-saan-charcoal dark:text-paper">Hours & capacity</h2>
          <div className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
                Working days
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_WEEKDAYS.map((day) => {
                  const selected = form.workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      aria-pressed={selected}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'border-saan-maroon/40 bg-saan-maroon/10 text-saan-charcoal dark:text-paper'
                          : 'border-saan-champagne/70 text-saan-ink/60 dark:border-white/15 dark:text-paper/60',
                      )}
                    >
                      {WEEKDAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AdminFormField label="Opening time" htmlFor="opening-time">
                <input
                  id="opening-time"
                  type="time"
                  value={form.openingTime}
                  onChange={(event) => updateForm('openingTime', event.target.value)}
                  className={adminInputClassName}
                  required
                />
              </AdminFormField>
              <AdminFormField label="Closing time" htmlFor="closing-time">
                <input
                  id="closing-time"
                  type="time"
                  value={form.closingTime}
                  onChange={(event) => updateForm('closingTime', event.target.value)}
                  className={adminInputClassName}
                  required
                />
              </AdminFormField>
              <AdminFormField label="Timezone" htmlFor="timezone">
                <input
                  id="timezone"
                  type="text"
                  value={form.timezone}
                  onChange={(event) => updateForm('timezone', event.target.value)}
                  className={adminInputClassName}
                  required
                />
              </AdminFormField>
              <AdminFormField label="Slot duration (minutes)" htmlFor="slot-duration">
                <input
                  id="slot-duration"
                  type="number"
                  min={15}
                  max={240}
                  value={form.slotDurationMinutes}
                  onChange={(event) =>
                    updateForm('slotDurationMinutes', Number(event.target.value) || 0)
                  }
                  className={adminInputClassName}
                  required
                />
              </AdminFormField>
              <AdminFormField label="Buffer (minutes)" htmlFor="buffer-minutes">
                <input
                  id="buffer-minutes"
                  type="number"
                  min={0}
                  max={120}
                  value={form.bufferMinutes}
                  onChange={(event) =>
                    updateForm('bufferMinutes', Number(event.target.value) || 0)
                  }
                  className={adminInputClassName}
                  required
                />
              </AdminFormField>
              <AdminFormField label="Max appointments / day" htmlFor="max-per-day">
                <input
                  id="max-per-day"
                  type="number"
                  min={1}
                  max={100}
                  value={form.maxAppointmentsPerDay}
                  onChange={(event) =>
                    updateForm('maxAppointmentsPerDay', Number(event.target.value) || 0)
                  }
                  className={adminInputClassName}
                  required
                />
              </AdminFormField>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-xl text-saan-charcoal dark:text-paper">
            Closures & special days
          </h2>
          <div className="mt-5 space-y-6">
            <AdminFormField
              label="Holidays (one YYYY-MM-DD per line)"
              htmlFor="holidays"
              hint="Closed all day"
            >
              <textarea
                id="holidays"
                rows={4}
                value={form.holidaysText}
                onChange={(event) => updateForm('holidaysText', event.target.value)}
                className={adminInputClassName}
                placeholder="2026-01-26"
              />
            </AdminFormField>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
                  Temporary closures
                </h3>
                <AdminButton
                  type="button"
                  variant="secondary"
                  className="px-2 py-1.5"
                  onClick={() =>
                    updateForm('temporaryClosures', [
                      ...form.temporaryClosures,
                      { date: '', reason: '' },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  Add
                </AdminButton>
              </div>
              <div className="space-y-3">
                {form.temporaryClosures.length === 0 && (
                  <p className="text-sm text-saan-ink/50 dark:text-paper/50">No temporary closures.</p>
                )}
                {form.temporaryClosures.map((item, index) => (
                  <div key={`closure-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(event) => {
                        const next = [...form.temporaryClosures];
                        next[index] = { ...item, date: event.target.value };
                        updateForm('temporaryClosures', next);
                      }}
                      className={adminInputClassName}
                      aria-label={`Temporary closure date ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={item.reason ?? ''}
                      onChange={(event) => {
                        const next = [...form.temporaryClosures];
                        next[index] = { ...item, reason: event.target.value };
                        updateForm('temporaryClosures', next);
                      }}
                      className={adminInputClassName}
                      placeholder="Reason (optional)"
                      aria-label={`Temporary closure reason ${index + 1}`}
                    />
                    <AdminButton
                      type="button"
                      variant="danger"
                      className="px-2 py-1.5"
                      onClick={() =>
                        updateForm(
                          'temporaryClosures',
                          form.temporaryClosures.filter((_, i) => i !== index),
                        )
                      }
                      aria-label={`Remove temporary closure ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </AdminButton>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
                  Special opening days
                </h3>
                <AdminButton
                  type="button"
                  variant="secondary"
                  className="px-2 py-1.5"
                  onClick={() =>
                    updateForm('specialOpeningDays', [
                      ...form.specialOpeningDays,
                      {
                        date: '',
                        openingTime: form.openingTime,
                        closingTime: form.closingTime,
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  Add
                </AdminButton>
              </div>
              <div className="space-y-3">
                {form.specialOpeningDays.length === 0 && (
                  <p className="text-sm text-saan-ink/50 dark:text-paper/50">No special opening days.</p>
                )}
                {form.specialOpeningDays.map((item, index) => (
                  <div
                    key={`special-${index}`}
                    className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <input
                      type="date"
                      value={item.date}
                      onChange={(event) => {
                        const next = [...form.specialOpeningDays];
                        next[index] = { ...item, date: event.target.value };
                        updateForm('specialOpeningDays', next);
                      }}
                      className={adminInputClassName}
                      aria-label={`Special day date ${index + 1}`}
                    />
                    <input
                      type="time"
                      value={item.openingTime}
                      onChange={(event) => {
                        const next = [...form.specialOpeningDays];
                        next[index] = { ...item, openingTime: event.target.value };
                        updateForm('specialOpeningDays', next);
                      }}
                      className={adminInputClassName}
                      aria-label={`Special day opening ${index + 1}`}
                    />
                    <input
                      type="time"
                      value={item.closingTime}
                      onChange={(event) => {
                        const next = [...form.specialOpeningDays];
                        next[index] = { ...item, closingTime: event.target.value };
                        updateForm('specialOpeningDays', next);
                      }}
                      className={adminInputClassName}
                      aria-label={`Special day closing ${index + 1}`}
                    />
                    <AdminButton
                      type="button"
                      variant="danger"
                      className="px-2 py-1.5"
                      onClick={() =>
                        updateForm(
                          'specialOpeningDays',
                          form.specialOpeningDays.filter((_, i) => i !== index),
                        )
                      }
                      aria-label={`Remove special day ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </AdminButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-saan-charcoal dark:text-paper">
              Appointment types
            </h2>
            <AdminButton
              type="button"
              variant="secondary"
              className="px-2 py-1.5"
              onClick={() =>
                updateForm('appointmentTypes', [
                  ...form.appointmentTypes,
                  { id: '', label: '', isActive: true },
                ])
              }
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Add type
            </AdminButton>
          </div>
          <div className="space-y-3">
            {form.appointmentTypes.map((type, index) => (
              <div
                key={`type-${index}`}
                className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto_auto]"
              >
                <input
                  type="text"
                  value={type.id}
                  onChange={(event) => {
                    const next = [...form.appointmentTypes];
                    next[index] = { ...type, id: event.target.value };
                    updateForm('appointmentTypes', next);
                  }}
                  onBlur={() => {
                    if (type.id.trim() || !type.label.trim()) return;
                    const next = [...form.appointmentTypes];
                    next[index] = { ...type, id: slugifyTypeId(type.label) };
                    updateForm('appointmentTypes', next);
                  }}
                  className={adminInputClassName}
                  placeholder="id"
                  aria-label={`Type id ${index + 1}`}
                />
                <input
                  type="text"
                  value={type.label}
                  onChange={(event) => {
                    const next = [...form.appointmentTypes];
                    next[index] = { ...type, label: event.target.value };
                    updateForm('appointmentTypes', next);
                  }}
                  className={adminInputClassName}
                  placeholder="Label"
                  aria-label={`Type label ${index + 1}`}
                />
                <label className="inline-flex items-center gap-2 text-sm text-saan-ink/70 dark:text-paper/70">
                  <input
                    type="checkbox"
                    checked={type.isActive}
                    onChange={(event) => {
                      const next = [...form.appointmentTypes];
                      next[index] = { ...type, isActive: event.target.checked };
                      updateForm('appointmentTypes', next);
                    }}
                  />
                  Active
                </label>
                <AdminButton
                  type="button"
                  variant="danger"
                  className="px-2 py-1.5"
                  onClick={() =>
                    updateForm(
                      'appointmentTypes',
                      form.appointmentTypes.filter((_, i) => i !== index),
                    )
                  }
                  aria-label={`Remove type ${type.label || index + 1}`}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </AdminButton>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-xl text-saan-charcoal dark:text-paper">
            Contact & guidelines
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Studio address (one line per row)"
              htmlFor="studio-address"
              className="md:col-span-2"
            >
              <textarea
                id="studio-address"
                rows={3}
                value={form.studioAddressText}
                onChange={(event) => updateForm('studioAddressText', event.target.value)}
                className={adminInputClassName}
                required
              />
            </AdminFormField>
            <AdminFormField label="Contact phone" htmlFor="contact-phone">
              <input
                id="contact-phone"
                type="tel"
                value={form.contactPhone}
                onChange={(event) => updateForm('contactPhone', event.target.value)}
                className={adminInputClassName}
                required
              />
            </AdminFormField>
            <AdminFormField label="Contact email" htmlFor="contact-email">
              <input
                id="contact-email"
                type="email"
                value={form.contactEmail}
                onChange={(event) => updateForm('contactEmail', event.target.value)}
                className={adminInputClassName}
                required
              />
            </AdminFormField>
            <AdminFormField
              label="Guidelines (one per line)"
              htmlFor="guidelines"
              className="md:col-span-2"
            >
              <textarea
                id="guidelines"
                rows={4}
                value={form.guidelinesText}
                onChange={(event) => updateForm('guidelinesText', event.target.value)}
                className={adminInputClassName}
              />
            </AdminFormField>
            <AdminFormField
              label="Cancellation policy"
              htmlFor="cancellation-policy"
              className="md:col-span-2"
            >
              <textarea
                id="cancellation-policy"
                rows={4}
                value={form.cancellationPolicy}
                onChange={(event) => updateForm('cancellationPolicy', event.target.value)}
                className={adminInputClassName}
                required
              />
            </AdminFormField>
          </div>
        </AdminCard>

        {formError && (
          <p className="text-sm text-red-700 dark:text-red-300" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <AdminButton type="submit" isLoading={saveMutation.isPending}>
            Save settings
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function Header() {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
        Atelier
      </p>
      <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
        Appointment Settings
      </h1>
    </div>
  );
}
