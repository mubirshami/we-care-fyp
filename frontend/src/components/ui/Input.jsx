import React, { useId } from 'react';

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
};

export default function Input({
  label,
  error,
  hint,
  id: externalId,
  size = 'md',
  required = false,
  className = '',
  ...props
}) {
  const autoId = useId();
  const id = externalId ?? autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
          {label}
          {required && (
            <span className="ml-0.5 text-error-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={[
          'w-full rounded-input border bg-white text-neutral-900',
          'placeholder:text-neutral-400',
          'transition-all duration-150 ease-in-out',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-error-500 focus:border-error-500 focus:ring-error-100'
            : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
          sizes[size] ?? sizes.md,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-xs text-error-600">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}
