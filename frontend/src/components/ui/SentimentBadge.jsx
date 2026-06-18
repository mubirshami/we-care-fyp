import React from 'react';

const SENTIMENT_CFG = {
  positive: { label: 'Positive', emoji: '😊', cls: 'bg-success-50 text-success-700' },
  negative: { label: 'Difficult', emoji: '😔', cls: 'bg-error-50 text-error-600' },
  neutral: { label: 'Neutral', emoji: '😐', cls: 'bg-neutral-100 text-neutral-600' },
};

export default function SentimentBadge({ sentiment }) {
  const key = (sentiment || '').toLowerCase();
  const cfg = SENTIMENT_CFG[key] || SENTIMENT_CFG.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium ${cfg.cls}`}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}
