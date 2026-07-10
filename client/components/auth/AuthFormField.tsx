import { cn } from '@/lib/utils';

const inputClassName =
  'w-full border border-saan-champagne/80 bg-transparent px-3 py-3 text-sm text-saan-ink placeholder:text-saan-ink/40 focus:border-saan-maroon focus:outline-none';

type AuthFormFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  disabled,
}: AuthFormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-label-caps mb-2 block text-saan-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClassName, error && 'border-saan-maroon')}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 font-body text-xs text-saan-maroon" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { inputClassName };
