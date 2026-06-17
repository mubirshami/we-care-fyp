import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import authService from '../../services/auth';
import AuthLayout from './AuthLayout';

function VerifyingState() {
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <svg className="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p className="text-sm text-neutral-500">Verifying your email address…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 border border-success-200">
        <svg className="h-7 w-7 text-success-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Email verified</h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          Your email address has been confirmed. You're all set — sign in to start your wellness journey.
        </p>
      </div>
      <Link to="/signin" className={['inline-flex h-11 w-full items-center justify-center', 'rounded-button bg-primary-500 text-sm font-semibold text-white', 'hover:bg-primary-600 transition-all duration-150 shadow-primary'].join(' ')}>
        Sign in to your account
      </Link>
    </div>
  );
}

function FailedState() {
  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50 border border-error-200">
        <svg className="h-7 w-7 text-error-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Verification failed</h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          This verification link has expired or has already been used. Verification links are valid for 24 hours.
        </p>
      </div>
      <div className="space-y-3">
        <Link to="/signup" className={['inline-flex h-11 w-full items-center justify-center', 'rounded-button bg-primary-500 text-sm font-semibold text-white', 'hover:bg-primary-600 transition-all duration-150 shadow-primary'].join(' ')}>
          Create a new account
        </Link>
        <Link to="/signin" className="block text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          Return to sign in
        </Link>
      </div>
    </div>
  );
}

export default function EmailVerify() {
  const { id, token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authService.verifyEmail(id, token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('failed'));
  }, [id, token]);

  return (
    <AuthLayout>
      {status === 'loading' && <VerifyingState />}
      {status === 'success' && <SuccessState />}
      {status === 'failed'  && <FailedState />}
    </AuthLayout>
  );
}
