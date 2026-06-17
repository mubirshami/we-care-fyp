import React from 'react';

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div
      className={['animate-shimmer rounded-button', width, height, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}

function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-card bg-white shadow-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLine width="w-10" height="h-10" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-1/2" />
          <SkeletonLine width="w-1/3" height="h-3" />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine width="w-5/6" />
      <SkeletonLine width="w-4/6" />
    </div>
  );
}

function ListSkeleton({ rows = 4 }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-card bg-white shadow-card p-4">
          <SkeletonLine width="w-8" height="h-8" className="rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-1/3" />
            <SkeletonLine width="w-1/2" height="h-3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function LoadingSkeleton({ variant = 'text', lines, rows, className = '' }) {
  const inner = {
    text: <TextSkeleton lines={lines ?? 3} />,
    card: <CardSkeleton />,
    list: <ListSkeleton rows={rows ?? 4} />,
  }[variant] ?? <TextSkeleton />;

  return (
    <div role="status" aria-label="Loading content" className={className}>
      {inner}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
