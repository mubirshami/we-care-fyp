import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout, { PasswordInput, AuthSpinner } from './AuthLayout';

function Signin() {
  const navigate = useNavigate();
  const { login, setUserName, logout } = useAuth();
  const isMounted = useRef(true);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    isMounted.current = true;
    logout();
    return () => { isMounted.current = false; };
  }, [logout]);

  const handleSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.post('/user/signin', { email: email.trim(), password });
        if (res?.status === 200 || res?.status === 201) {
          login(res.data.token);
          setUserName(res.data.name || '');
          if (isMounted.current) navigate('/home');
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404)
          setError('No account found with that email address.');
        else if (status === 401 || status === 400)
          setError(err?.response?.data?.message || 'Incorrect email or password. Please try again.');
        else
          setError('Something went wrong. Please try again in a moment.');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [email, password, loading, login, setUserName, navigate]
  );

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-neutral-900">Welcome back</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to continue your wellness journey.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSignIn} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="signin-email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className={[
                'w-full rounded-input border bg-white px-4 py-3 text-sm text-neutral-900',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2 transition-all duration-150',
                'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
              ].join(' ')}
            />
          </div>

          <PasswordInput
            id="signin-password"
            label="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="flex justify-end -mt-1">
            <Link
              to="/forgotpassword"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-input border border-error-100 bg-error-50 px-4 py-3">
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-error-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-error-700">{error}</p>
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
                <span>Signing in…</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          New to We Care?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signin;
