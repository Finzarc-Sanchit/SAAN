import { cn } from '@/lib/utils';

type RegisterProgressProps = {
  currentStep: 1 | 2 | 3;
};

const STEPS = ['Details', 'Verify', 'Welcome'] as const;

export function RegisterProgress({ currentStep }: RegisterProgressProps) {
  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        {STEPS.map((label, index) => {
          const stepNumber = (index + 1) as 1 | 2 | 3;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold',
                  isComplete && 'border-saan-maroon bg-saan-maroon text-paper',
                  isActive && !isComplete && 'border-saan-maroon text-ink',
                  !isActive && !isComplete && 'border-saan-champagne text-saan-ink/40',
                )}
              >
                {stepNumber}
              </span>
              <span
                className={cn(
                  'text-label-caps text-[10px]',
                  isActive || isComplete ? 'text-ink' : 'text-saan-ink/40',
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-px w-full bg-saan-champagne/50">
        <div
          className="h-px bg-saan-maroon transition-all duration-500 ease-[var(--ease-luxury)]"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
