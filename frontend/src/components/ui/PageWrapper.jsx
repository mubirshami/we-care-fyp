import React from 'react';

const maxWidths = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  full: 'max-w-full',
};

export default function PageWrapper({ children, maxWidth = 'lg', className = '' }) {
  return (
    <main
      className={[
        'mx-auto w-full px-4 py-6 sm:px-6 sm:py-8',
        maxWidths[maxWidth] ?? maxWidths.lg,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </main>
  );
}
