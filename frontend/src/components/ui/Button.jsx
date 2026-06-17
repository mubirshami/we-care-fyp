import React from 'react';

const variants = {
  primary: [
    'bg-primary-500 text-white',
    'hover:bg-primary-600',
    'shadow-primary',
    'disabled:bg-primary-300 disabled:shadow-none',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ].join(' '),

  secondary: [
    'bg-white text-neutral-800',
    'border border-neutral-200',
    'hover:bg-neutral-50 hover:border-neutral-300',
    'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200',
    'focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
  ].join(' '),

  danger: [
    'bg-error-50 text-error-600',
    'border border-error-100',
    'hover:bg-error-500 hover:text-white hover:border-error-500',
    'disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-600',
    'hover:bg-neutral-100 hover:text-neutral-800',
    'disabled:text-neutral-300',
    'focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
  ].join(' '),
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-button gap-1.5',
  md: 'h-10 px-4 text-sm rounded-button gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2',
};

function Spinner({ size }) {
  const dim = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <svg
      className={`animate-spin shrink-0 ${dim}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-150 ease-in-out',
        'disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && <Spinner size={size} />}
      {children}
    </button>
  );
}
