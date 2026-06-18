import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ isOpen, onClose, title, description, children, size = 'md' }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    panel.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!focusable.length) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === panel) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || document.activeElement === panel) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return createPortal(
    <div
      ref={overlayRef}
      role="presentation"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={[
          'relative w-full rounded-modal bg-white shadow-xl focus:outline-none',
          widths[size] ?? widths.md,
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-neutral-500">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="ml-4 rounded-button p-1.5 text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
