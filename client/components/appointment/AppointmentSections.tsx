'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppointmentForm } from '@/components/appointment/AppointmentForm';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Container } from '@/components/ui/Container';
import { getAppointmentContext } from '@/lib/api/appointments';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { APPOINTMENT_COPY, ATELIER_COPY } from '@/lib/site-content';
import {
  WEEKDAY_LABELS,
  type PublicAppointmentSettings,
  type Weekday,
} from '@/lib/types/appointment.schemas';

function formatHoursLine(openingTime: string, closingTime: string): string {
  return `${openingTime} — ${closingTime}`;
}

function formatWorkingDays(workingDays: Weekday[]): string {
  if (workingDays.length === 0) return ATELIER_COPY.visit.details[1]?.lines[0] ?? '';
  const sorted = [...workingDays].sort((a, b) => a - b);
  if (sorted.length === 1) {
    return WEEKDAY_LABELS[sorted[0] as Weekday];
  }
  const first = sorted[0] as Weekday;
  const last = sorted[sorted.length - 1] as Weekday;
  const isContiguous = sorted.every((day, index) => index === 0 || day === sorted[index - 1]! + 1);
  if (isContiguous) {
    return `${WEEKDAY_LABELS[first]} to ${WEEKDAY_LABELS[last]}`;
  }
  return sorted.map((day) => WEEKDAY_LABELS[day]).join(', ');
}

export function AppointmentBookingSection() {
  const [settings, setSettings] = useState<PublicAppointmentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      setIsLoading(true);
      setError(null);
      try {
        const context = await getAppointmentContext();
        if (!cancelled) {
          setSettings(context.settings);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? getApiErrorMessage(err)
              : 'We could not load appointment details. Please try again shortly.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadContext();

    return () => {
      cancelled = true;
    };
  }, []);

  const hoursSummary = useMemo(() => {
    if (!settings) {
      return {
        days: ATELIER_COPY.visit.details[1]?.lines[0] ?? 'Tuesday to Saturday',
        hours: ATELIER_COPY.visit.details[1]?.lines[1] ?? '11AM — 7PM',
      };
    }
    return {
      days: formatWorkingDays(settings.workingDays),
      hours: formatHoursLine(settings.openingTime, settings.closingTime),
    };
  }, [settings]);

  const addressLines =
    settings?.studioAddressLines ?? ATELIER_COPY.visit.details[0]?.lines ?? [];
  const phone = settings?.contactPhone ?? ATELIER_COPY.visit.details[2]?.lines[0] ?? '';
  const email = settings?.contactEmail ?? ATELIER_COPY.visit.details[2]?.lines[1] ?? '';
  const guidelines = settings?.guidelines ?? [];
  const cancellationPolicy = settings?.cancellationPolicy ?? '';
  const durationMinutes = settings?.slotDurationMinutes;
  const showPolicyRow = guidelines.length > 0 || Boolean(cancellationPolicy);

  return (
    <section
      aria-labelledby="appointment-form-heading"
      className="bg-neutral-100 pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24"
    >
      <Container>
        <div className="space-y-12 lg:space-y-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14 xl:gap-16">
            <ScrollReveal>
              <aside className="space-y-8 lg:sticky lg:top-24">
                <div>
                  <h1 id="appointment-form-heading" className="text-display-l text-ink">
                    {APPOINTMENT_COPY.intro.title}
                  </h1>
                  <p className="text-body-l mt-5 text-neutral-700">
                    {APPOINTMENT_COPY.intro.description}
                  </p>
                </div>

                <dl className="space-y-6 border-t border-neutral-300 pt-8">
                  <div>
                    <dt className="text-h3 text-ink">{APPOINTMENT_COPY.info.addressLabel}</dt>
                    <dd className="text-body mt-2 text-ink">
                      {addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-h3 text-ink">{APPOINTMENT_COPY.info.hoursLabel}</dt>
                    <dd className="text-body mt-2 text-ink">{hoursSummary.days}</dd>
                    <dd className="text-body mt-1 text-neutral-700">{hoursSummary.hours}</dd>
                  </div>
                  <div>
                    <dt className="text-h3 text-ink">{APPOINTMENT_COPY.info.contactLabel}</dt>
                    <dd className="text-body mt-2 text-ink">
                      {phone ? (
                        <a
                          href={`tel:${phone.replace(/\s+/g, '')}`}
                          className="block transition-opacity hover:opacity-70"
                        >
                          {phone}
                        </a>
                      ) : null}
                      {email ? (
                        <a
                          href={`mailto:${email}`}
                          className="mt-1 block transition-opacity hover:opacity-70"
                        >
                          {email}
                        </a>
                      ) : null}
                    </dd>
                  </div>
                  {typeof durationMinutes === 'number' && (
                    <div>
                      <dt className="text-h3 text-ink">
                        {APPOINTMENT_COPY.info.durationLabel}
                      </dt>
                      <dd className="text-body mt-2 text-ink">{durationMinutes} minutes</dd>
                      <dd className="text-body mt-1 text-neutral-700">
                        {APPOINTMENT_COPY.info.durationNote}
                      </dd>
                    </div>
                  )}
                </dl>
              </aside>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-paper px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
                <h2 className="text-h3 mb-8 text-ink">{APPOINTMENT_COPY.form.title}</h2>
                <AppointmentForm
                  settings={settings}
                  contextError={error}
                  isContextLoading={isLoading}
                />
              </div>
            </ScrollReveal>
          </div>

          {showPolicyRow && (
            <ScrollReveal>
              <div className="grid grid-cols-1 gap-10 border-t border-neutral-300 pt-10 md:grid-cols-2 md:gap-14 lg:pt-12">
                {guidelines.length > 0 && (
                  <div>
                    <h2 className="text-h3 text-ink">{APPOINTMENT_COPY.info.guidelinesTitle}</h2>
                    <ul className="mt-5 space-y-3">
                      {guidelines.map((item) => (
                        <li key={item} className="text-body text-neutral-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cancellationPolicy && (
                  <div>
                    <h2 className="text-h3 text-ink">{APPOINTMENT_COPY.info.cancellationTitle}</h2>
                    <p className="text-body mt-5 text-neutral-700">{cancellationPolicy}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
      </Container>
    </section>
  );
}
