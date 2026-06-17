import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import auth from '../services/modules/auth';
import AuthLayout, { PasswordInput, AuthSpinner } from '../components/auth/AuthLayout';

// ── Loading state ─────────────────────────────────────────────────────────────

function VerifyingState() {
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <svg
          className="h-8 w-8 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p className="text-sm text-neutral-500">Verifying your reset link…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}

// ── Invalid link state ────────────────────────────────────────────────────────

function InvalidLinkState() {
  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50 border border-error-200">
        <svg
          className="h-7 w-7 text-error-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Link has expired</h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          This password reset link has expired or has already been used. Reset links are valid for 1 hour.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          to="/forgotpassword"
          className={[
            'inline-flex h-11 w-full items-center justify-center',
            'rounded-button bg-primary-500 text-sm font-semibold text-white',
            'hover:bg-primary-600 transition-all duration-150 shadow-primary',
          ].join(' ')}
        >
          Request a new link
        </Link>
        <Link
          to="/signin"
          className="block text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Return to sign in
        </Link>
      </div>
    </div>
  );
}

// ── Success state — shown after password is reset ─────────────────────────────

function SuccessState() {
  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 border border-success-200">
        <svg
          className="h-7 w-7 text-success-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Password updated</h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
      </div>

      <Link
        to="/signin"
        className={[
          'inline-flex h-11 w-full items-center justify-center',
          'rounded-button bg-primary-500 text-sm font-semibold text-white',
          'hover:bg-primary-600 transition-all duration-150 shadow-primary',
        ].join(' ')}
      >
        Sign in to your account
      </Link>
    </div>
  );
}

// ── Reset password form ───────────────────────────────────────────────────────

function ResetForm({ id, token }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const confirmError =
    confirm && password !== confirm ? 'Passwords do not match.' : '';

  const canSubmit = password.length >= 8 && password === confirm && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await auth.doReset(id, token, { password });
      setDone(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Something went wrong. Please try requesting a new reset link.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) return <SuccessState />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Create new password</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Choose a strong password to protect your account.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="reset-password"
          label="New password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          hint="At least 8 characters"
          autoComplete="new-password"
          showStrength
        />

        <PasswordInput
          id="reset-confirm"
          label="Confirm new password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(''); }}
          error={confirmError}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-input border border-error-100 bg-error-50 px-4 py-3">
            <svg
              className="h-4 w-4 shrink-0 mt-0.5 text-error-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-error-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
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
              <span>Updating password…</span>
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PasswordReset() {
  const { id, token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid'

  useEffect(() => {
    auth.verifyReset(id, token)
      .then(() => setStatus('valid'))
      .catch(() => setStatus('invalid'));
  }, [id, token]);

  return (
    <AuthLayout>
      {status === 'loading' && <VerifyingState />}
      {status === 'invalid' && <InvalidLinkState />}
      {status === 'valid'   && <ResetForm id={id} token={token} />}
    </AuthLayout>
  );
}
