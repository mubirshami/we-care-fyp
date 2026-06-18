import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import journalsService from '../../services/journals';
import mlService from '../../services/ml';
import emotiontimeService from '../../services/emotiontime';
import usersService from '../../services/users';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { getEntryDate, calcStreak, MS_DAY } from '../../utils/journal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekDayCount(journals) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const entryDays = new Set(journals.map((j) => getEntryDate(j).toDateString()));
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * MS_DAY);
    if (entryDays.has(d.toDateString())) count++;
  }
  return count;
}

function computeSentimentDist(entries) {
  const counts = { positive: 0, negative: 0, neutral: 0 };
  entries.forEach((j) => {
    const s = (j.sentiment || 'neutral').toLowerCase();
    if (s === 'positive') counts.positive++;
    else if (s === 'negative') counts.negative++;
    else counts.neutral++;
  });
  return { ...counts, total: entries.length };
}

function generateKeyInsight(journals, last7, streak) {
  if (journals.length === 0) {
    return {
      headline: 'Your story starts here',
      subtext: 'Write your first journal entry to begin seeing your emotional patterns.',
      recommendation: null,
      type: 'empty',
    };
  }
  if (last7.length === 0) {
    return {
      headline: 'Time to reconnect',
      subtext: "You haven't journaled in over a week. A lot can happen in that time.",
      recommendation: 'Even a few sentences can help you check back in with yourself.',
      type: 'inactive',
    };
  }
  const withSentiment = last7.filter((j) => j.sentiment);
  const n = withSentiment.length;
  const posCount = withSentiment.filter((j) => j.sentiment.toLowerCase() === 'positive').length;
  const negCount = withSentiment.filter((j) => j.sentiment.toLowerCase() === 'negative').length;
  const times = last7.length === 1 ? 'once' : `${last7.length} times`;

  if (n === 0) {
    return {
      headline: `You've reflected ${times} this week`,
      subtext: 'Your entries are beginning to build a picture of how you process your days.',
      recommendation:
        streak >= 3 ? `A ${streak}-day streak — consistency like this adds up.` : null,
      type: 'neutral',
    };
  }
  if (posCount / n > 0.6) {
    return {
      headline: 'A mostly positive week',
      subtext: `You've reflected ${times} this week, and your entries lean positive.`,
      recommendation:
        streak >= 2
          ? `You're on a ${streak}-day streak — something's working.`
          : "Keep noticing what's going well.",
      type: 'positive',
    };
  }
  if (negCount / n > 0.6) {
    return {
      headline: 'Some heaviness this week',
      subtext: `You've reflected ${times} this week. Your entries show you're carrying some weight.`,
      recommendation: 'Writing about it is already a form of care. Be kind to yourself.',
      type: 'negative',
    };
  }
  return {
    headline: 'A steady, mixed week',
    subtext: `You've reflected ${times} this week with a range of emotions.`,
    recommendation:
      streak >= 2
        ? `${streak} days in a row — consistency matters more than always feeling good.`
        : 'Every entry adds to your understanding of yourself.',
    type: 'neutral',
  };
}

// ── Insight card config ───────────────────────────────────────────────────────

const INSIGHT_TYPE_CFG = {
  positive: {
    cardCls: 'bg-success-50 border-success-200',
    labelCls: 'text-success-600',
    headlineCls: 'text-success-900',
    subtextCls: 'text-success-800',
    recCls: 'text-success-700',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    iconCls: 'text-success-500',
  },
  negative: {
    cardCls: 'bg-error-50 border-error-200',
    labelCls: 'text-error-500',
    headlineCls: 'text-error-900',
    subtextCls: 'text-error-800',
    recCls: 'text-error-700',
    iconPath:
      'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
    iconCls: 'text-error-400',
  },
  neutral: {
    cardCls: 'bg-neutral-50 border-neutral-200',
    labelCls: 'text-neutral-500',
    headlineCls: 'text-neutral-900',
    subtextCls: 'text-neutral-700',
    recCls: 'text-neutral-600',
    iconPath: 'M3.75 9h16.5m-16.5 6.75h16.5',
    iconCls: 'text-neutral-400',
  },
  inactive: {
    cardCls: 'bg-warning-50 border-warning-200',
    labelCls: 'text-warning-600',
    headlineCls: 'text-warning-900',
    subtextCls: 'text-warning-800',
    recCls: 'text-warning-700',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    iconCls: 'text-warning-500',
  },
  empty: {
    cardCls: 'bg-primary-50 border-primary-100',
    labelCls: 'text-primary-500',
    headlineCls: 'text-primary-900',
    subtextCls: 'text-primary-800',
    recCls: 'text-primary-700',
    iconPath:
      'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z',
    iconCls: 'text-primary-400',
  },
};

// ── Emotion detection config ──────────────────────────────────────────────────

const EMOTION_MAP = {
  happy: { emoji: '😊', label: 'Happy', note: "It's a good moment to sit with this feeling." },
  sad: {
    emoji: '😔',
    label: 'Sad',
    note: 'Being aware of sadness is the first step toward working through it.',
  },
  angry: {
    emoji: '😤',
    label: 'Tense',
    note: 'Noticing tension early gives you a chance to respond rather than react.',
  },
  surprised: {
    emoji: '😲',
    label: 'Surprised',
    note: 'Surprise can signal that something matters more than you realized.',
  },
  fearful: {
    emoji: '😟',
    label: 'Anxious',
    note: "Awareness of anxiety is a skill — and you're already practising it.",
  },
  disgusted: {
    emoji: '😔',
    label: 'Unsettled',
    note: 'Strong reactions often point to what we care about most.',
  },
  neutral: { emoji: '😐', label: 'Calm', note: 'A calm state is a good place to reflect from.' },
};

function getEmotionCfg(emotion) {
  return (
    EMOTION_MAP[(emotion || '').toLowerCase()] || {
      emoji: '🤔',
      label: emotion || 'Unknown',
      note: 'Take a moment to notice how you feel right now.',
    }
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function KeyInsightSkeleton() {
  return (
    <div
      className="rounded-card border border-neutral-200 bg-white p-6 space-y-3"
      role="status"
      aria-label="Loading"
    >
      <div className="h-2.5 w-16 rounded animate-shimmer" />
      <div className="h-5 w-2/3 rounded animate-shimmer" />
      <div className="h-4 w-full rounded animate-shimmer" />
      <div className="h-4 w-4/5 rounded animate-shimmer" />
      <span className="sr-only">Loading insight</span>
    </div>
  );
}

function KeyInsightCard({ insight }) {
  const cfg = INSIGHT_TYPE_CFG[insight.type] || INSIGHT_TYPE_CFG.neutral;
  return (
    <section className={`rounded-card border p-6 ${cfg.cardCls}`} aria-label="Weekly insight">
      <div className="flex items-start gap-4">
        <svg
          className={`h-5 w-5 shrink-0 mt-0.5 ${cfg.iconCls}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={cfg.iconPath} />
        </svg>
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${cfg.labelCls}`}>
            This week
          </p>
          <h2 className={`text-lg font-display font-semibold ${cfg.headlineCls}`}>
            {insight.headline}
          </h2>
          <p className={`mt-1.5 text-sm leading-relaxed ${cfg.subtextCls}`}>{insight.subtext}</p>
          {insight.recommendation && (
            <p className={`mt-3 text-sm font-medium ${cfg.recCls}`}>{insight.recommendation}</p>
          )}
          {insight.type === 'empty' && (
            <Link
              to="/journal"
              className="mt-4 inline-flex h-9 items-center rounded-button bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600 transition-all duration-150"
            >
              Write your first entry
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function SentimentBarRow({ label, emoji, count, total, barCls }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-neutral-700 flex items-center gap-1.5">
          <span aria-hidden="true">{emoji}</span>
          {label}
        </span>
        <span className="text-xs text-neutral-500">
          {count} {count === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-neutral-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${barCls}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SentimentDistributionSection({ dist, loading }) {
  if (loading) return <LoadingSkeleton variant="list" rows={3} />;

  const hasData = dist.total >= 3;

  return (
    <section aria-label="Emotional patterns">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">Emotional patterns</h2>
        <p className="mt-0.5 text-xs text-neutral-500">Based on your last 30 days of entries</p>
      </div>
      {hasData ? (
        <div className="rounded-card border border-neutral-200 bg-white shadow-card px-5 py-5 space-y-4">
          <SentimentBarRow
            label="Positive"
            emoji="😊"
            count={dist.positive}
            total={dist.total}
            barCls="bg-success-400"
          />
          <SentimentBarRow
            label="Neutral"
            emoji="😐"
            count={dist.neutral}
            total={dist.total}
            barCls="bg-neutral-300"
          />
          <SentimentBarRow
            label="Difficult"
            emoji="😔"
            count={dist.negative}
            total={dist.total}
            barCls="bg-error-300"
          />
          <p className="pt-1 text-xs text-neutral-400">
            {dist.total} {dist.total === 1 ? 'entry' : 'entries'} in this period
          </p>
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-neutral-600">Not enough data yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            Write a few more entries and your patterns will start to emerge.
          </p>
        </div>
      )}
    </section>
  );
}

function MoodDot({ sentiment }) {
  const key = (sentiment || 'neutral').toLowerCase();
  const cls =
    key === 'positive' ? 'bg-success-400' : key === 'negative' ? 'bg-error-300' : 'bg-neutral-300';
  return (
    <div
      className={`h-3 w-3 rounded-full shrink-0 ${cls}`}
      role="img"
      aria-label={key === 'positive' ? 'Positive' : key === 'negative' ? 'Difficult' : 'Neutral'}
    />
  );
}

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center text-center px-3 py-4 flex-1">
      <p className="text-2xl font-display font-bold text-neutral-900 tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-neutral-500 leading-snug">{label}</p>
    </div>
  );
}

function ReflectionHabitsSection({ journals, streak, weekDayCount, loading }) {
  if (loading) return <LoadingSkeleton variant="list" rows={2} />;

  const monthCount = journals.filter(
    (j) => Date.now() - getEntryDate(j).getTime() < 30 * MS_DAY
  ).length;

  const recent14 = [...journals].slice(0, 14).reverse();

  return (
    <section aria-label="Reflection habits">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">Reflection habits</h2>
        <p className="mt-0.5 text-xs text-neutral-500">How consistently you've been showing up</p>
      </div>

      {journals.length === 0 ? (
        <div className="rounded-card border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-neutral-600">No entries yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            Your journaling habits will appear here once you start writing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="rounded-card border border-neutral-200 bg-white shadow-card divide-x divide-neutral-100 flex overflow-hidden">
            <StatPill value={`${weekDayCount}/7`} label="Days this week" />
            <StatPill value={monthCount} label="Entries this month" />
            <StatPill value={streak > 0 ? `${streak}d` : '—'} label="Current streak" />
          </div>

          {/* Mood timeline */}
          {recent14.length >= 2 && (
            <div className="rounded-card border border-neutral-200 bg-white shadow-card px-5 py-4">
              <p className="text-xs font-semibold text-neutral-600 mb-3">
                Recent mood pattern
                <span className="ml-1.5 font-normal text-neutral-400">
                  (last {recent14.length} {recent14.length === 1 ? 'entry' : 'entries'})
                </span>
              </p>
              <div
                className="flex items-center gap-2 flex-wrap"
                role="list"
                aria-label="Mood timeline from oldest to most recent"
              >
                {recent14.map((j, i) => (
                  <div key={j._id || i} role="listitem">
                    <MoodDot sentiment={j.sentiment} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">Older</span>
                <div className="flex items-center gap-3 flex-1 justify-center">
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <span
                      className="h-2 w-2 rounded-full bg-success-400 inline-block"
                      aria-hidden="true"
                    />
                    Positive
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <span
                      className="h-2 w-2 rounded-full bg-neutral-300 inline-block"
                      aria-hidden="true"
                    />
                    Neutral
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <span
                      className="h-2 w-2 rounded-full bg-error-300 inline-block"
                      aria-hidden="true"
                    />
                    Difficult
                  </span>
                </div>
                <span className="text-xs text-neutral-400">Recent</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Emotion detection (check-in) ──────────────────────────────────────────────

function EmotionResult({ data }) {
  const dominant =
    data.dominant_emotion ||
    data.emotion ||
    Object.keys(data).find((k) => k !== 'emotionTime' && typeof data[k] === 'number');

  const cfg = getEmotionCfg(dominant);

  const secondary = Object.entries(data)
    .filter(
      ([k, v]) =>
        k !== 'dominant_emotion' &&
        k !== 'emotionTime' &&
        typeof v === 'number' &&
        k.toLowerCase() !== (dominant || '').toLowerCase()
    )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => getEmotionCfg(k));

  return (
    <div
      className="rounded-card border border-neutral-200 bg-white shadow-card p-5 space-y-3"
      role="status"
      aria-live="polite"
      aria-label={`Detected emotion: ${cfg.label}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl shrink-0" aria-hidden="true">
          {cfg.emoji}
        </span>
        <div>
          <p className="text-base font-display font-semibold text-neutral-900">{cfg.label}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Detected just now</p>
        </div>
      </div>
      {cfg.note && <p className="text-sm text-neutral-600 leading-relaxed">{cfg.note}</p>}
      {secondary.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-neutral-400">Also present:</span>
          {secondary.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-pill bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
            >
              <span aria-hidden="true">{s.emoji}</span>
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckInSection({ detecting, emotionData, onDetect }) {
  return (
    <section aria-label="Emotional check-in">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">How are you feeling right now?</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          A camera check-in can reveal what words sometimes can't. Allow camera access when
          prompted.
        </p>
      </div>
      <div className="rounded-card border border-neutral-200 bg-white shadow-card p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
            <svg
              className="h-5 w-5 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Facial emotion check-in</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Takes a moment. Your camera is not recorded or stored.
            </p>
          </div>
        </div>
        <Button onClick={onDetect} loading={detecting} variant="primary" size="md">
          {detecting ? 'Reading your expression…' : 'Begin check-in'}
        </Button>
        {emotionData && <EmotionResult data={emotionData} />}
      </div>
    </section>
  );
}

// ── Sentiment chart (ML backend) ──────────────────────────────────────────────

function MoodOverTimeSection({ token }) {
  const [chartUrl, setChartUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mlBase = import.meta.env.VITE_ML_URL || 'http://localhost:5000';

  useEffect(() => {
    let objectUrl = '';
    (async () => {
      try {
        const res = await usersService.getId(token);
        const userId = res.data.user_id;
        const imgRes = await fetch(`${mlBase}/total_time_spent?user_id=${userId}`);
        if (!imgRes.ok) throw new Error();
        const blob = await imgRes.blob();
        objectUrl = URL.createObjectURL(blob);
        setChartUrl(objectUrl);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, mlBase]);

  return (
    <section aria-label="Mood over time">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">Your mood over time</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Sentiment and time-spent trends from your journaling sessions
        </p>
      </div>
      {loading ? (
        <LoadingSkeleton variant="card" />
      ) : error ? (
        <div className="rounded-card border border-dashed border-neutral-200 bg-neutral-50 px-5 py-12 text-center">
          <p className="text-3xl mb-3" aria-hidden="true">
            📊
          </p>
          <p className="text-sm font-medium text-neutral-600">Timeline not available yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            Your mood timeline will appear here as you build up a journaling history.
          </p>
        </div>
      ) : (
        <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
          <div className="p-4">
            <img
              src={chartUrl}
              alt="Mood and time-spent trend chart showing sentiment over your journaling history"
              className="w-full rounded-md"
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Insights() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [journals, setJournals] = useState([]);
  const [journalsLoading, setJournalsLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [emotionData, setEmotionData] = useState(null);

  const loadJournals = useCallback(() => {
    setJournalsLoading(true);
    journalsService
      .getAll(token)
      .then((res) => setJournals(Array.isArray(res.data) ? res.data : []))
      .catch(() => addToast('Could not load your journal data.', 'error'))
      .finally(() => setJournalsLoading(false));
  }, [token, addToast]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const handleDetect = useCallback(async () => {
    setDetecting(true);
    setEmotionData(null);
    try {
      const data = await mlService.emotionDetection();
      setEmotionData(data);
      if (data?.emotionTime != null) {
        await emotiontimeService.post({ emotionTime: data.emotionTime }, token).catch(() => null);
      }
    } catch {
      addToast('Check-in failed. Please try again.', 'error');
    } finally {
      setDetecting(false);
    }
  }, [token, addToast]);

  // Derived values
  const now = Date.now();
  const last7 = journals.filter((j) => now - getEntryDate(j).getTime() < 7 * MS_DAY);
  const last30 = journals.filter((j) => now - getEntryDate(j).getTime() < 30 * MS_DAY);
  const streak = calcStreak(journals);
  const weekDayCount = getWeekDayCount(journals);
  const dist = computeSentimentDist(last30);
  const keyInsight = generateKeyInsight(journals, last7, streak);

  return (
    <div className="max-w-[820px] mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Insights</h1>
        <p className="text-sm text-neutral-500">
          Understanding your emotional patterns and habits.
        </p>
      </header>

      {/* ── Top: Key insight ── */}
      {journalsLoading ? <KeyInsightSkeleton /> : <KeyInsightCard insight={keyInsight} />}

      {/* ── Middle: Patterns + Habits ── */}
      <SentimentDistributionSection dist={dist} loading={journalsLoading} />
      <ReflectionHabitsSection
        journals={journals}
        streak={streak}
        weekDayCount={weekDayCount}
        loading={journalsLoading}
      />

      {/* ── Bottom: Check-in + Chart ── */}
      <CheckInSection detecting={detecting} emotionData={emotionData} onDetect={handleDetect} />
      <MoodOverTimeSection token={token} />
    </div>
  );
}
