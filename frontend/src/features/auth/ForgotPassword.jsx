import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../services/auth';
import AuthLayout, { AuthSpinner } from './AuthLayout';

function EmailSentState({ email }) {
  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 border border-primary-200">
        <svg className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Check your inbox</h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          We sent a password reset link to{' '}
          <span className="font-semibold text-neutral-700">{email}</span>.
        </p>
        <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
          The link expires in 1 hour. If you don't see the email, check your spam folder.
        </p>
      </div>
      <Link
        to="/signin"
        className={[
          'inline-flex h-11 w-full items-center justify-center gap-2',
          'rounded-button bg-primary-500 text-sm font-semibold text-white',
          'hover:bg-primary-600 transition-all duration-150 shadow-primary',
        ].join(' ')}
      >
        Return to sign in
      </Link>
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.requestPassword({ email: email.trim() });
      if (res.status === 200) setSent(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404)
        setError('No account found with that email address.');
      else
        setError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <EmailSentState email={email} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <Link
            to="/signin"
            className="mb-5 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors w-fit"
            aria-label="Back to sign in"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </Link>
          <h2 className="text-2xl font-display font-semibold text-neutral-900">Reset your password</h2>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
            Enter the email address associated with your account and we'll send you a reset link.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              aria-describedby={error ? 'forgot-error' : undefined}
              aria-invalid={!!error}
              className={[
                'w-full rounded-input border bg-white px-4 py-3 text-sm text-neutral-900',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2 transition-all duration-150',
                error
                  ? 'border-error-400 focus:border-error-500 focus:ring-error-100'
                  : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
              ].join(' ')}
            />
            {error && (
              <p id="forgot-error" role="alert" className="text-xs text-error-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={[
              'w-full h-11 inline-flex items-center justify-center gap-2',
              'rounded-button bg-primary-500 text-sm font-semibold text-white',
              'hover:bg-primary-600 active:bg-primary-700',
              'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'transition-all duration-150 shadow-primary',
            ].join(' ')}
          >
            {loading ? (
              <>
                <AuthSpinner />
                <span>Sending reset link…</span>
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
