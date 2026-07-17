'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { formatAdminDate } from '@/lib/admin/date-range-status';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  listAdminNewsletterCampaigns,
  newsletterQueryKeys,
} from '@/lib/api/newsletter';
import { cn } from '@/lib/utils';

const HISTORY_LIMIT = 10;

export function NewsletterHistory() {
  const [page, setPage] = useState(1);
  const params = { page, limit: HISTORY_LIMIT };
  const historyQuery = useQuery({
    queryKey: newsletterQueryKeys.campaigns(params),
    queryFn: () => listAdminNewsletterCampaigns(params),
  });

  return (
    <AdminCard>
      <div className="mb-5">
        <h2 className="font-display text-xl text-saan-charcoal dark:text-paper">
          Send history
        </h2>
        <p className="mt-1 text-sm text-saan-ink/60 dark:text-paper/60">
          Aggregate delivery history without exposing recipient addresses.
        </p>
      </div>

      {historyQuery.isLoading ? (
        <p className="py-8 text-sm text-saan-ink/60 dark:text-paper/60">
          Loading history…
        </p>
      ) : historyQuery.isError ? (
        <div className="py-8">
          <p className="text-sm text-error">
            {historyQuery.error instanceof ApiError
              ? getApiErrorMessage(historyQuery.error)
              : 'Could not load send history'}
          </p>
          <button
            type="button"
            onClick={() => void historyQuery.refetch()}
            className="mt-3 text-sm underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
        <p className="py-8 text-sm text-saan-ink/60 dark:text-paper/60">
          No newsletters have been sent yet.
        </p>
      ) : (
        <div className="divide-y divide-saan-champagne/50 border-y border-saan-champagne/50 dark:divide-white/10 dark:border-white/10">
          {historyQuery.data?.items.map((campaign) => (
            <article
              key={campaign.id}
              className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <h3 className="truncate font-medium text-saan-charcoal dark:text-paper">
                  {campaign.subject}
                </h3>
                <p className="mt-1 text-xs text-saan-ink/55 dark:text-paper/55">
                  {formatAdminDate(campaign.queuedAt ?? campaign.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 font-bold uppercase tracking-[0.08em]',
                    campaign.status === 'queued'
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                      : campaign.status === 'failed'
                        ? 'bg-red-500/10 text-error'
                        : 'bg-neutral-300/50 text-neutral-700 dark:bg-white/10 dark:text-paper/70',
                  )}
                >
                  {campaign.status.replace('_', ' ')}
                </span>
                <span className="text-saan-ink/65 dark:text-paper/65">
                  {campaign.queuedCount}/{campaign.recipientCount} queued
                </span>
                {campaign.failedCount > 0 && (
                  <span className="text-error">
                    {campaign.failedCount} failed
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {(historyQuery.data?.meta.total ?? 0) > HISTORY_LIMIT && (
        <AdminPagination
          page={page}
          limit={HISTORY_LIMIT}
          total={historyQuery.data?.meta.total ?? 0}
          onPageChange={setPage}
        />
      )}
    </AdminCard>
  );
}
