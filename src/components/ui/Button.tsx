'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] disabled:bg-gray-400',
  secondary: 'bg-white text-[var(--color-brand)] border-2 border-[var(--color-brand)] hover:bg-blue-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', fullWidth = false, className = '', type = 'button', ...rest },
  ref
) {
  const classes = [
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold',
    'min-h-[48px] transition-colors disabled:cursor-not-allowed disabled:opacity-70',
    variants[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button ref={ref} type={type} className={classes} {...rest} />;
});
