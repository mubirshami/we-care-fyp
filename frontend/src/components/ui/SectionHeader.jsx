import React from 'react';

export default function SectionHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={['flex items-start justify-between gap-4 mb-6', className].filter(Boolean).join(' ')}>
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
