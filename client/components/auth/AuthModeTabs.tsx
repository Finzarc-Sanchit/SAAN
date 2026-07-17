import { cn } from '@/lib/utils';
import type { AuthPageMode } from '@/lib/auth/auth-page';

type AuthModeTabsProps = {
  mode: Extract<AuthPageMode, 'register' | 'login'>;
  onChange: (mode: Extract<AuthPageMode, 'register' | 'login'>) => void;
};

const TABS = [
  { id: 'login' as const, label: 'Sign In' },
  { id: 'register' as const, label: 'Register' },
];

export function AuthModeTabs({ mode, onChange }: AuthModeTabsProps) {
  return (
    <div className="mb-8 flex border-b border-saan-champagne/60">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'text-label-caps flex-1 pb-3 transition-colors',
            mode === tab.id
              ? 'border-b-2 border-saan-maroon text-ink'
              : 'text-saan-ink/40 hover:text-saan-ink',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
