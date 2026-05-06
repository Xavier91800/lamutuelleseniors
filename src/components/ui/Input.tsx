'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className = '', ...rest },
  ref
) {
  const inputId = id ?? rest.name ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-base font-medium text-gray-800">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          'min-h-[48px] rounded-lg border px-4 text-base',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
