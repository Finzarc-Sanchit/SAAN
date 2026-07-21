import type { SizeChart } from '@/lib/size-guide';
import { cn } from '@/lib/utils';

type SizeGuideChartsProps = {
  charts: readonly SizeChart[];
  className?: string;
};

export function SizeGuideCharts({ charts, className }: SizeGuideChartsProps) {
  return (
    <div className={cn('space-y-10', className)}>
      {charts.map((chart) => (
        <div key={chart.title}>
          <h3 className="text-center font-body text-sm font-semibold uppercase tracking-[0.06em] text-ink">
            {chart.title}
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-center">
              <thead>
                <tr>
                  {chart.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="border border-neutral-300 px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.04em] text-ink"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row, rowIndex) => (
                  <tr key={`${chart.title}-${rowIndex}`}>
                    {chart.columns.map((column) => (
                      <td
                        key={column.key}
                        className="border border-neutral-300 px-3 py-2.5 font-body text-sm text-ink"
                      >
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
