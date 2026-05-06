'use client';

import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  hint?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, id, className = '', ...rest },
  ref
) {
  const inputId = id ?? rest.name ?? `chk-${Math.random().toString(36).slice(2, 8)}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="flex items-start gap-3 text-base text-gray-800">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`mt-1 h-6 w-6 cursor-pointer rounded border-gray-400 text-[var(--color-brand)] focus:ring-[var(--color-brand)] ${className}`}
          {...rest}
        />
        <span className="flex-1">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="ml-9 text-sm text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="ml-9 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
