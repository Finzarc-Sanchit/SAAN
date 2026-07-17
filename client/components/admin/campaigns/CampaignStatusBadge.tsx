'use client';

import { cn } from '@/lib/utils';
import { DateRangeStatusBadge } from '@/components/admin/ui/DateRangeStatusBadge';
import { getDateRangeStatus } from '@/lib/admin/date-range-status';
import type { AdminCampaign } from '@/lib/types/campaign';

export function CampaignStatusBadge({ campaign }: { campaign: AdminCampaign }) {
  if (!campaign.active) {
    return (
      <span
        className={cn(
          'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
          'bg-saan-maroon/10 text-ink dark:bg-red-500/15 dark:text-red-300',
        )}
      >
        Inactive
      </span>
    );
  }

  return (
    <DateRangeStatusBadge
      status={getDateRangeStatus(campaign.startDate, campaign.endDate)}
    />
  );
}
