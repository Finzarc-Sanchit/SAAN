'use client';

import { SummaryStatCards } from '@/components/admin/dashboard/SummaryStatCards';
import { MonthlyTargetCard } from '@/components/admin/dashboard/MonthlyTargetCard';
import { MonthlySalesCard } from '@/components/admin/dashboard/MonthlySalesCard';
import { StatisticsCard } from '@/components/admin/dashboard/StatisticsCard';
import { MostItemsSaleCard } from '@/components/admin/dashboard/MostItemsSaleCard';
import { RecentOrdersCard } from '@/components/admin/dashboard/RecentOrdersCard';

export function AdminDashboardPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Overview
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Dashboard
        </h1>
      </div>

      <SummaryStatCards />

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-2">
          <MonthlyTargetCard />
        </div>
        <div className="lg:col-span-3">
          <MonthlySalesCard />
        </div>
      </div>

      <StatisticsCard />

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-2">
          <MostItemsSaleCard />
        </div>
        <div className="lg:col-span-3">
          <RecentOrdersCard />
        </div>
      </div>
    </div>
  );
}
