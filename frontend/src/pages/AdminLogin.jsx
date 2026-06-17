import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { PasswordInput, AuthSpinner } from '../components/auth/AuthLayout';
import api from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAuth();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.post('/user/admin-signin', { password });
        setAdmin(res.data.adminToken);
        addToast('Signed in as administrator.', 'success');
        navigate('/viewusers');
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401)
          setError('Incorrect password. Please try again.');
        else
          setError('Sign in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [password, loading, setAdmin, navigate, addToast]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-neutral-50">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="h-8 w-8 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-primary-500)' }}
          >
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-lg font-display font-bold text-neutral-900">We Care</span>
        </div>

        {/* Form card */}
        <div className="rounded-card border border-neutral-200 bg-white shadow-card p-8">
          <div className="mb-6">
            <h1 className="text-lg font-display font-semibold text-neutral-900">Administration</h1>
            <p className="mt-1 text-sm text-neutral-500">Authorised access only.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <PasswordInput
              id="admin-password"
              label="Admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter admin password"
              autoComplete="current-password"
            />

            {error && (
              <p role="alert" className="text-sm text-error-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className={[
                'w-full h-10 inline-flex items-center justify-center gap-2',
                'rounded-button bg-neutral-900 text-sm font-semibold text-white',
                'hover:bg-neutral-800 active:bg-neutral-700',
                'focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-150',
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
        </div>

        <div className="mt-5 text-center">
          <Link
            to="/signin"
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ← Return to app
          </Link>
        </div>
      </div>
    </div>
  );
}
