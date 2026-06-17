import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout, { PasswordInput, AuthSpinner } from './AuthLayout';

function validate(values) {
  const errors = {};
  if (!values.name.trim())
    errors.name = 'Please enter your full name.';
  else if (values.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.';
  if (!values.email.trim())
    errors.email = 'Please enter your email address.';
  if (!values.password)
    errors.password = 'Please create a password.';
  else if (values.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';
  if (!values.confirm)
    errors.confirm = 'Please confirm your password.';
  else if (values.password !== values.confirm)
    errors.confirm = 'Passwords do not match.';
  return errors;
}

function SuccessState({ email }) {
  return (
    <div className="space-y-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 border border-success-200">
        <svg className="h-7 w-7 text-success-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Check your inbox</h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          We sent a verification link to{' '}
          <span className="font-semibold text-neutral-700">{email}</span>.
          Click the link to activate your account and start your wellness journey.
        </p>
        <p className="mt-3 text-xs text-neutral-400">
          The link expires in 24 hours. If you don't see it, check your spam folder.
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

function Signup() {
  const { logout } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { logout(); }, [logout]);

  const errors = validate(values);
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key])
  );
  const isValid = Object.keys(errors).length === 0;

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (serverError) setServerError('');
  };

  const blur = (field) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/user/signup', {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      if (res.status === 200 || res.status === 201) setSubmitted(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409)
        setServerError('An account with this email address already exists.');
      else if (status === 400)
        setServerError(err?.response?.data?.message || 'Please check your details and try again.');
      else
        setServerError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout>
        <SuccessState email={values.email} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-neutral-900">Start your journey</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Create your account to begin taking care of your mind.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="block text-sm font-medium text-neutral-700">Full name</label>
            <input
              id="signup-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              value={values.name}
              onChange={set('name')}
              onBlur={blur('name')}
              aria-invalid={!!visibleErrors.name}
              aria-describedby={visibleErrors.name ? 'name-error' : undefined}
              className={[
                'w-full rounded-input border bg-white px-4 py-3 text-sm text-neutral-900',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2 transition-all duration-150',
                visibleErrors.name
                  ? 'border-error-400 focus:border-error-500 focus:ring-error-100'
                  : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
              ].join(' ')}
            />
            {visibleErrors.name && (
              <p id="name-error" role="alert" className="text-xs text-error-600">{visibleErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="block text-sm font-medium text-neutral-700">Email address</label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={set('email')}
              onBlur={blur('email')}
              aria-invalid={!!visibleErrors.email}
              aria-describedby={visibleErrors.email ? 'email-error' : undefined}
              className={[
                'w-full rounded-input border bg-white px-4 py-3 text-sm text-neutral-900',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2 transition-all duration-150',
                visibleErrors.email
                  ? 'border-error-400 focus:border-error-500 focus:ring-error-100'
                  : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
              ].join(' ')}
            />
            {visibleErrors.email && (
              <p id="email-error" role="alert" className="text-xs text-error-600">{visibleErrors.email}</p>
            )}
          </div>

          <PasswordInput
            id="signup-password"
            label="Password"
            value={values.password}
            onChange={set('password')}
            onBlur={blur('password')}
            error={visibleErrors.password}
            hint="At least 8 characters"
            autoComplete="new-password"
            showStrength
          />

          <PasswordInput
            id="signup-confirm"
            label="Confirm password"
            value={values.confirm}
            onChange={set('confirm')}
            onBlur={blur('confirm')}
            error={visibleErrors.confirm}
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />

          {serverError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-input border border-error-100 bg-error-50 px-4 py-3">
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-error-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-error-700">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
                <span>Creating your account…</span>
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;
