'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { inputClassName } from '@/components/auth/AuthFormField';

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  disabled,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-label-caps mb-2 block text-saan-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClassName, 'pr-10', error && 'border-saan-maroon')}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-saan-ink/50 hover:text-ink"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.25} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.25} />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 font-body text-xs text-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
