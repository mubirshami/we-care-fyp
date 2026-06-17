import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const typeConfig = {
  success: {
    bar:  'bg-success-500',
    icon: 'bg-success-50 text-success-600',
    text: 'text-neutral-900',
    wrap: 'bg-white border border-success-200',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    bar:  'bg-error-500',
    icon: 'bg-error-50 text-error-600',
    text: 'text-neutral-900',
    wrap: 'bg-white border border-error-200',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    bar:  'bg-warning-500',
    icon: 'bg-warning-50 text-warning-600',
    text: 'text-neutral-900',
    wrap: 'bg-white border border-warning-200',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    bar:  'bg-info-500',
    icon: 'bg-info-50 text-info-600',
    text: 'text-neutral-900',
    wrap: 'bg-white border border-info-200',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
};

function Toast({ id, message, type, onDismiss }) {
  const cfg = typeConfig[type] ?? typeConfig.info;

  return (
    <div
      role="alert"
      className={[
        'animate-slide-in',
        'relative flex w-80 items-start gap-3 overflow-hidden rounded-card p-4 shadow-card',
        cfg.wrap,
      ].join(' ')}
    >
      {/* Left color bar */}
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-card ${cfg.bar}`} aria-hidden="true" />

      {/* Icon */}
      <span className={`ml-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${cfg.icon}`}>
        <span className="h-3.5 w-3.5">{cfg.svg}</span>
      </span>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium ${cfg.text}`}>{message}</p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-button p-0.5 text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-600"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2"
      >
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

export default ToastProvider;
