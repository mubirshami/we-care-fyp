import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import journalsService from '../../services/journals';
import { useToast } from '../../components/ui/ToastProvider';
import { getTodayEntry } from '../../utils/journal';

// ── Constants ─────────────────────────────────────────────────────────────────

const DIALOGFLOW_URL =
  'https://console.dialogflow.com/api-client/demo/embedded/a1f2ab4e-1c9d-455f-b88d-139f5dc4b0cf';

const SUGGESTIONS = [
  { text: "I've been feeling anxious lately and I'm not sure why" },
  { text: 'I want to talk through something that happened today' },
  { text: "I've been carrying something I haven't said out loud" },
  { text: 'Help me figure out what to write in my journal' },
  { text: "I've noticed a pattern in my mood and want to understand it" },
  { text: 'Things have felt heavy lately — I need some perspective' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRecentSentiment(journals) {
  const withSentiment = journals.slice(0, 3).filter((j) => j.sentiment);
  if (!withSentiment.length) return null;
  const counts = {};
  withSentiment.forEach((j) => {
    const s = j.sentiment.toLowerCase();
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
}

// ── Context copy ──────────────────────────────────────────────────────────────

function getContextContent(journals, todayEntry, recentSentiment) {
  if (journals.length === 0) {
    return {
      headline: 'Welcome — nothing here is too small to say',
      subtext:
        "The chatbot listens without judgment. Whatever is on your mind is worth exploring, even if you're not sure how to start.",
      journalLink: null,
      cls: 'bg-primary-50 border-primary-100',
      headlineCls: 'text-primary-800',
      subtextCls: 'text-primary-700',
    };
  }

  if (todayEntry && (todayEntry.sentiment || '').toLowerCase() === 'negative') {
    return {
      headline: 'You shared something heavy in your journal today',
      subtext:
        'Writing can only carry so much. If you want to talk it through, this is a good place for that.',
      journalLink: { to: '/journal?tab=history', label: 'Read your entry' },
      cls: 'bg-primary-50 border-primary-100',
      headlineCls: 'text-primary-800',
      subtextCls: 'text-primary-700',
    };
  }

  if (todayEntry) {
    return {
      headline: 'You reflected in your journal earlier today',
      subtext:
        'Want to explore what came up a little further? The chatbot can help you go deeper on what you wrote.',
      journalLink: { to: '/journal?tab=history', label: 'Read your entry' },
      cls: 'bg-success-50 border-success-200',
      headlineCls: 'text-success-800',
      subtextCls: 'text-success-700',
    };
  }

  if (recentSentiment === 'negative') {
    return {
      headline: 'Your recent reflections have felt a little heavy',
      subtext:
        "Sometimes talking comes first and writing follows. The chatbot is here whenever you're ready.",
      journalLink: { to: '/journal', label: "Write today's entry" },
      cls: 'bg-primary-50 border-primary-100',
      headlineCls: 'text-primary-800',
      subtextCls: 'text-primary-700',
    };
  }

  return {
    headline: 'A space to think out loud',
    subtext:
      'Whatever is on your mind — big or small — the chatbot is here to help you work through it without judgment.',
    journalLink: null,
    cls: 'bg-neutral-50 border-neutral-200',
    headlineCls: 'text-neutral-800',
    subtextCls: 'text-neutral-600',
  };
}

// ── Components ────────────────────────────────────────────────────────────────

function ContextBannerSkeleton() {
  return (
    <div
      className="rounded-card border border-neutral-100 bg-neutral-50 px-5 py-4 space-y-2"
      role="status"
      aria-label="Loading"
    >
      <div className="h-3.5 w-56 rounded animate-shimmer" />
      <div className="h-3 w-full rounded animate-shimmer" />
      <div className="h-3 w-4/5 rounded animate-shimmer" />
      <span className="sr-only">Loading personalised context</span>
    </div>
  );
}

function ContextBanner({ content }) {
  return (
    <aside
      className={`rounded-card border px-5 py-4 ${content.cls}`}
      aria-label="Personalised context"
    >
      <p className={`text-sm font-semibold ${content.headlineCls}`}>{content.headline}</p>
      <p className={`mt-1 text-sm leading-relaxed ${content.subtextCls}`}>{content.subtext}</p>
      {content.journalLink && (
        <Link
          to={content.journalLink.to}
          className={`mt-2 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 ${content.subtextCls} hover:opacity-70 transition-opacity`}
        >
          {content.journalLink.label}
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      )}
    </aside>
  );
}

function ChatFrame() {
  return (
    <section aria-label="Chat with We Care Support">
      <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
        {/* Trust header */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50"
          aria-hidden="true"
        >
          <div className="h-2 w-2 rounded-full bg-success-400 shrink-0" />
          <p className="text-xs font-medium text-neutral-600">We Care Support</p>
          <span className="text-neutral-300 text-xs select-none">·</span>
          <p className="text-xs text-neutral-400">AI-assisted · Not recorded</p>
        </div>
        <iframe
          title="We Care Support Chatbot"
          allow="microphone;"
          src={DIALOGFLOW_URL}
          className="w-full border-0 block"
          style={{ height: '520px' }}
        />
      </div>
    </section>
  );
}

function SuggestionChip({ text, onCopy }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(text)}
      className={[
        'w-full text-left rounded-card border border-neutral-200 bg-white shadow-card',
        'px-4 py-3 text-sm text-neutral-700 leading-relaxed',
        'hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800',
        'active:scale-[0.99] transition-all duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      <span className="flex items-start gap-2">
        <svg
          className="h-3.5 w-3.5 shrink-0 mt-[3px] text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
        {text}
      </span>
    </button>
  );
}

function SuggestionsSection({ onCopy }) {
  return (
    <section aria-label="Conversation starters">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-neutral-700">Not sure where to start?</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Click any of these to copy it, then paste it into the chat above.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => (
          <li key={s.text}>
            <SuggestionChip text={s.text} onCopy={onCopy} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    journalsService
      .getAll(token)
      .then((res) => setJournals(Array.isArray(res.data) ? res.data : []))
      .catch(() => null) // journal context is enhancement, not core — fail silently
      .finally(() => setLoading(false));
  }, [token]);

  const handleCopy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast('Copied — paste it into the chat above to get started.', 'success');
      } catch {
        addToast(
          "Couldn't copy automatically. Try selecting the text and copying it manually.",
          'warning'
        );
      }
    },
    [addToast]
  );

  const todayEntry = getTodayEntry(journals);
  const recentSentiment = getRecentSentiment(journals);
  const contextContent = getContextContent(journals, todayEntry, recentSentiment);

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-5">
      <header>
        <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Chat</h1>
        <p className="text-sm text-neutral-500">
          A space to think out loud, work through feelings, and find some clarity.
        </p>
      </header>

      {/* Top: personalised introduction */}
      {loading ? <ContextBannerSkeleton /> : <ContextBanner content={contextContent} />}

      {/* Middle: conversation */}
      <ChatFrame />

      {/* Bottom: suggested follow-up prompts */}
      <SuggestionsSection onCopy={handleCopy} />

      {/* Disclaimer */}
      <p className="text-center text-xs text-neutral-400 pb-2" role="note">
        This chatbot is an AI assistant and is not a substitute for professional mental health care.
      </p>
    </div>
  );
}
