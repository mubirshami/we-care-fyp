import React from 'react';

export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center',
        'rounded-card border border-dashed border-neutral-200 bg-neutral-50',
        'px-6 py-16 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <div className="mb-4 text-neutral-300" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-700">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
