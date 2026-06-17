import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import journalsService from '../../services/journals';

const DAILY_PROMPTS = [
  "What's one thing on your mind right now?",
  "What made you feel something today?",
  "What are you grateful for in this moment?",
  "What's been weighing on you lately?",
  "How has today felt so far?",
  "What would make today feel meaningful?",
  "Is there something you've been avoiding thinking about?",
  "What small thing went well today?",
  "What do you need right now that you haven't asked for?",
  "How does your body feel as you sit with this moment?",
  "What's the first word that comes to mind about this week?",
  "What would you tell a close friend who felt the way you feel now?",
  "What are you looking forward to, even slightly?",
  "What would you do differently if today started over?",
  "What emotion are you carrying into this moment?",
  "What's one thing you noticed today that you usually wouldn't?",
  "What would feel like progress today?",
  "What have you been carrying alone lately?",
  "What does your ideal tomorrow look like?",
  "What have you learned about yourself recently?",
  "What brought you here today?",
  "What does calm feel like to you right now?",
  "What's something kind you did for yourself this week?",
  "What's the hardest part of right now?",
  "What made you smile today, even briefly?",
  "What's one thing you're proud of, however small?",
  "How would you describe this chapter of your life?",
  "What do you wish someone understood about how you're feeling?",
  "What has stayed constant for you recently?",
  "What do you need to let go of?",
];

function getDailyPrompt() {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return DAILY_PROMPTS[dayIndex % DAILY_PROMPTS.length];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getEntryDate(journal) {
  if (journal.createdAt) return new Date(journal.createdAt);
  if (journal._id) return new Date(parseInt(journal._id.substring(0, 8), 16) * 1000);
  return new Date();
}

function formatRelativeFull(date) {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  if (diffDays === 0) return `Today · ${dayName}`;
  if (diffDays === 1) return `Yesterday · ${dayName}`;
  if (diffDays < 7) return `${diffDays} days ago · ${dayName}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function firstSentence(text, maxLen = 110) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const end = clean.search(/[.!?]/);
  if (end > 0 && end < maxLen) return clean.slice(0, end + 1);
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.7 ? cut.slice(0, lastSpace) : cut) + '…';
}

function calcStreak(journals) {
  if (!journals.length) return 0;
  const uniqueDays = [...new Set(journals.map((j) => getEntryDate(j).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
  let streak = 0;
  let cursor = new Date(uniqueDays[0]);
  for (const dayStr of uniqueDays) {
    if (dayStr === cursor.toDateString()) { streak++; cursor = new Date(cursor.getTime() - 86_400_000); } else break;
  }
  return streak;
}

function getTodayEntry(journals) {
  const todayStr = new Date().toDateString();
  return journals.find((j) => getEntryDate(j).toDateString() === todayStr) || null;
}

function getWeeklyDots(journals) {
  const todayStr = new Date().toDateString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const entryDays = new Set(journals.map((j) => getEntryDate(j).toDateString()));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = d.toDateString();
    return { label: ['M','T','W','T','F','S','S'][i], isToday: dStr === todayStr, isFuture: d > today, hasEntry: entryDays.has(dStr) };
  });
}

const SENTIMENT_CFG = {
  positive: { label: 'Positive', emoji: '😊', cls: 'bg-success-50 text-success-700' },
  negative: { label: 'Negative', emoji: '😔', cls: 'bg-error-50 text-error-600' },
  neutral:  { label: 'Neutral',  emoji: '😐', cls: 'bg-neutral-100 text-neutral-600' },
};

function SentimentBadge({ sentiment }) {
  const key = (sentiment || '').toLowerCase();
  const cfg = SENTIMENT_CFG[key] || SENTIMENT_CFG.neutral;
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium ${cfg.cls}`}>
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

function TodayCardSkeleton() {
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-6 shadow-card space-y-4" role="status" aria-label="Loading">
      <div className="h-3 w-20 rounded animate-shimmer" />
      <div className="h-6 w-3/4 rounded animate-shimmer" />
      <div className="h-4 w-2/5 rounded animate-shimmer" />
      <div className="mt-2 h-11 w-full rounded-button animate-shimmer" />
      <span className="sr-only">Loading today's card</span>
    </div>
  );
}

function PromptCard({ prompt }) {
  return (
    <div className="rounded-card border p-6" style={{ backgroundColor: 'var(--color-primary-50)', borderColor: 'var(--color-primary-100)' }}>
      <p className="text-xs font-semibold text-primary-600 mb-3">Today's reflection</p>
      <h2 className="text-lg font-display font-semibold text-neutral-900 leading-snug mb-1">{prompt}</h2>
      <p className="text-sm text-neutral-500 mb-6">Write freely — there are no rules here.</p>
      <Link
        to="/journal"
        className={['flex h-11 w-full items-center justify-center gap-2', 'rounded-button bg-primary-500 text-sm font-semibold text-white', 'hover:bg-primary-600 active:bg-primary-700', 'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2', 'transition-all duration-150 shadow-primary'].join(' ')}
      >
        Begin writing
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}

function CompletionCard({ todayEntry }) {
  const date = getEntryDate(todayEntry);
  const preview = firstSentence(todayEntry.content);
  return (
    <div className="rounded-card border p-6" style={{ backgroundColor: 'var(--color-success-50)', borderColor: 'var(--color-success-200)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-success-100)' }}>
          <svg className="h-3.5 w-3.5 text-success-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-success-700">You've reflected today</p>
        <span className="ml-auto text-xs text-neutral-400">{formatTime(date)}</span>
      </div>
      <div className="border-t mb-4" style={{ borderColor: 'var(--color-success-100)' }} />
      <div className="space-y-3 mb-5">
        {todayEntry.sentiment && <SentimentBadge sentiment={todayEntry.sentiment} />}
        {preview && <p className="text-sm text-neutral-600 leading-relaxed">"{preview}"</p>}
      </div>
      <div className="flex gap-3">
        <Link to="/journal?tab=history" className={['flex h-9 flex-1 items-center justify-center rounded-button', 'border border-success-300 bg-white text-xs font-semibold text-success-700', 'hover:bg-success-50 transition-all duration-150'].join(' ')}>View entry</Link>
        <Link to="/journal" className={['flex h-9 flex-1 items-center justify-center rounded-button', 'bg-success-500 text-xs font-semibold text-white', 'hover:bg-success-600 transition-all duration-150'].join(' ')}>Write another</Link>
      </div>
    </div>
  );
}

function TodayCard({ todayEntry, prompt, loading }) {
  if (loading) return <TodayCardSkeleton />;
  return todayEntry ? <CompletionCard todayEntry={todayEntry} /> : <PromptCard prompt={prompt} />;
}

function WeekTrackerSkeleton() {
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card" role="status" aria-label="Loading">
      <div className="h-3 w-16 rounded animate-shimmer mb-4" />
      <div className="flex justify-between">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-4 w-4 rounded-full animate-shimmer" />
            <div className="h-2 w-2 rounded animate-shimmer" />
          </div>
        ))}
      </div>
      <div className="h-3 w-20 rounded animate-shimmer mt-4" />
      <span className="sr-only">Loading week tracker</span>
    </div>
  );
}

function WeekTracker({ weekDots, loading }) {
  if (loading) return <WeekTrackerSkeleton />;
  const daysWithEntries = weekDots.filter((d) => d.hasEntry).length;
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card">
      <p className="text-xs font-semibold text-neutral-500 mb-4">This week</p>
      <div className="flex items-end justify-between" role="list" aria-label="Weekly journal activity">
        {weekDots.map((dot, i) => (
          <div key={i} role="listitem" className="flex flex-col items-center gap-1.5">
            <div
              aria-label={`${dot.label}${dot.isToday ? ' (today)' : ''}${dot.hasEntry ? ', entry logged' : ''}`}
              className={['h-4 w-4 rounded-full transition-all duration-200', dot.hasEntry ? 'bg-primary-500' : dot.isFuture ? 'bg-neutral-100' : 'bg-neutral-200', dot.isToday ? 'ring-2 ring-primary-300 ring-offset-1' : ''].join(' ')}
            />
            <span className={`text-[10px] font-medium leading-none ${dot.isToday ? 'text-primary-600' : 'text-neutral-400'}`}>{dot.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        {daysWithEntries === 0 ? 'No entries this week yet' : `${daysWithEntries} of 7 days`}
      </p>
    </div>
  );
}

function StreakCardSkeleton() {
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card" role="status" aria-label="Loading">
      <div className="h-3 w-12 rounded animate-shimmer mb-3" />
      <div className="h-8 w-16 rounded animate-shimmer mb-2" />
      <div className="h-3 w-24 rounded animate-shimmer" />
      <span className="sr-only">Loading streak</span>
    </div>
  );
}

function StreakCard({ streak, journaledToday, loading }) {
  if (loading) return <StreakCardSkeleton />;
  if (streak === 0) {
    return (
      <div className="rounded-card border border-neutral-200 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold text-neutral-500 mb-3">Streak</p>
        <p className="text-3xl font-display font-bold mb-1" style={{ color: 'var(--color-neutral-300)' }} aria-label="No current streak">—</p>
        <p className="text-xs text-neutral-500 leading-snug">Start one today</p>
      </div>
    );
  }
  return (
    <div className="rounded-card border p-4 shadow-card" style={{ backgroundColor: 'var(--color-success-50)', borderColor: 'var(--color-success-200)' }} aria-label={`${streak} day streak`}>
      <p className="text-xs font-semibold text-success-700 mb-2">Streak</p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-display font-bold text-success-700">{streak}</span>
        <span className="text-sm font-medium text-success-600">days</span>
      </div>
      <p className="text-xs text-success-600 leading-snug">
        {journaledToday ? 'Come back tomorrow to keep it going' : 'Journal today to keep it going'}
      </p>
    </div>
  );
}

function ReflectionCard({ journal }) {
  const date = getEntryDate(journal);
  const preview = firstSentence(journal.content);
  return (
    <div className="rounded-card border border-neutral-200 bg-white px-5 py-4 shadow-card">
      <div className="flex items-center justify-between gap-3 mb-2">
        <time className="text-xs font-medium text-neutral-500" dateTime={date.toISOString()}>{formatRelativeFull(date)}</time>
        {journal.sentiment && <SentimentBadge sentiment={journal.sentiment} />}
      </div>
      {preview && <p className="text-sm text-neutral-600 leading-relaxed">"{preview}"</p>}
    </div>
  );
}

function ErrorBanner({ onRetry }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-card border border-error-100 bg-error-50 px-4 py-3">
      <svg className="h-4 w-4 shrink-0 mt-0.5 text-error-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      <div className="min-w-0">
        <p className="text-sm font-medium text-error-700">Couldn't load your data</p>
        <p className="text-xs text-error-600 mt-0.5">
          Check your connection and{' '}
          <button onClick={onRetry} className="underline hover:no-underline font-medium">try again</button>.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { name, token } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const loadJournals = () => {
    setLoading(true);
    setFetchError(false);
    journalsService
      .getAll(token)
      .then((res) => setJournals(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(loadJournals, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayEntry    = getTodayEntry(journals);
  const streak        = calcStreak(journals);
  const weeklyDots    = getWeeklyDots(journals);
  const dailyPrompt   = getDailyPrompt();

  const recentEntries = journals
    .filter((j) => !todayEntry || j._id !== todayEntry._id)
    .slice(0, 2);

  return (
    <div className="max-w-[820px] mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-5">

      <section aria-label="Greeting">
        <p className="text-sm text-neutral-500">{formatDate()}</p>
        <h1 className="mt-1 text-2xl font-display font-semibold text-neutral-900">
          {getGreeting()}{name ? `, ${name.split(' ')[0]}` : ''}.
        </h1>
      </section>

      {fetchError && <ErrorBanner onRetry={loadJournals} />}

      <TodayCard todayEntry={todayEntry} prompt={dailyPrompt} loading={loading} />

      <div className="grid grid-cols-2 gap-4" aria-label="Weekly progress">
        <WeekTracker weekDots={weeklyDots} loading={loading} />
        <StreakCard streak={streak} journaledToday={!!todayEntry} loading={loading} />
      </div>

      {!loading && recentEntries.length > 0 && (
        <section aria-label="Recent reflections">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">Recent reflections</h2>
            <Link to="/journal?tab=history" className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">View all</Link>
          </div>
          <ul className="space-y-3">
            {recentEntries.map((journal) => (
              <li key={journal._id}><ReflectionCard journal={journal} /></li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
