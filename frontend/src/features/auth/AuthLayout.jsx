import React, { useState } from 'react';

// ── Password strength scorer ──────────────────────────────────────────────────

function calcStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0–5
}

// ── Shared sub-components exported for auth pages ────────────────────────────

export function AuthSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin shrink-0"
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

export function PasswordStrength({ password }) {
  if (!password) return null;
  const score = calcStrength(password);
  const pct = Math.round((score / 5) * 100);
  const [barColor, labelColor, label] =
    score <= 1
      ? ['bg-error-500', 'text-error-600', 'Weak']
      : score <= 2
        ? ['bg-warning-500', 'text-warning-600', 'Fair']
        : score <= 3
          ? ['bg-primary-400', 'text-primary-600', 'Good']
          : ['bg-success-500', 'text-success-700', 'Strong'];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden" role="presentation">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${labelColor}`}>{label} password</p>
    </div>
  );
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete = 'current-password',
  showStrength = false,
  placeholder = 'Enter password',
  required = true,
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            'w-full rounded-input border bg-white px-4 py-3 pr-11 text-sm text-neutral-900',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 transition-all duration-150',
            error
              ? 'border-error-400 focus:border-error-500 focus:ring-error-100'
              : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          {visible ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {showStrength && <PasswordStrength password={value} />}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error-600">
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

// ── Brand panel (desktop left, lg+) ──────────────────────────────────────────

const TRUST_ITEMS = [
  {
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    text: 'Your journal entries are private and never shared',
  },
  {
    icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
    text: 'Understand your emotions through guided reflection',
  },
  {
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.5zm-9 0c0-.621.504-1.125 1.125-1.125h2.25C7.5 3.375 8.004 3.879 8.004 4.5v3.75c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 012.625 8.25V4.5z',
    text: 'Track your mood and see patterns over time',
  },
];

function BrandPanel() {
  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-[52%] lg:min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary-900)' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="absolute -top-48 -right-48 h-[500px] w-[500px] rounded-full"
        style={{ backgroundColor: 'var(--color-primary-700)', opacity: 0.35, filter: 'blur(72px)' }}
      />
      <div
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full"
        style={{ backgroundColor: 'var(--color-primary-800)', opacity: 0.55, filter: 'blur(56px)' }}
      />
      <div
        className="absolute top-[40%] left-[30%] h-72 w-72 rounded-full"
        style={{ backgroundColor: 'var(--color-primary-600)', opacity: 0.12, filter: 'blur(64px)' }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">We Care</span>
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-display font-semibold text-white leading-tight tracking-tight">
              A calmer mind
              <br />
              starts here.
            </h1>
            <p
              className="mt-4 text-base leading-relaxed max-w-sm"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Reflect on your emotions, build self-awareness, and take steps toward better mental
              wellbeing — at your own pace.
            </p>
          </div>
          <ul className="space-y-4">
            {TRUST_ITEMS.map((item, i) => (
              <li key={i} className="flex items-center gap-3.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--color-primary-200)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
          We Care · Mental Wellness Platform
        </p>
      </div>
    </aside>
  );
}

// ── AuthLayout ────────────────────────────────────────────────────────────────

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-50">
      <BrandPanel />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:px-12 lg:overflow-y-auto">
        <div className="lg:hidden mb-10 self-start flex items-center gap-2.5">
          <div
            className="h-8 w-8 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-primary-500)' }}
          >
            <svg
              className="h-4 w-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-lg font-display font-bold text-neutral-900">We Care</span>
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
