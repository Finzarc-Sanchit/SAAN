'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

const OTP_LENGTH = 6;

export function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, '').slice(-1);
    const next = digits.map((current, currentIndex) =>
      currentIndex === index ? sanitized : current,
    );
    onChange(next.join(''));

    if (sanitized && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted.padEnd(pasted.length, '').slice(0, OTP_LENGTH));

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="One-time passcode">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            onPaste={handlePaste}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !digits[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
              }
            }}
            className={cn(
              'h-12 w-10 border border-saan-champagne/80 bg-transparent text-center font-body text-lg text-saan-ink focus:border-saan-maroon focus:outline-none sm:h-14 sm:w-12',
              error && 'border-saan-maroon',
            )}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center font-body text-xs text-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
