import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import journalsService from '../../services/journals';
import mlService from '../../services/ml';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

// ── Prompts ────────────────────────────────────────────────────────────────────

const JOURNAL_PROMPTS = [
  "What's one thing that happened today that you'd like to remember?",
  "What emotion has stayed with you most today, and why?",
  "What's something you're still making sense of from this week?",
  "What are you grateful for today, even in a small way?",
  "What would you like to let go of before tomorrow?",
  "What felt hard today, and what helped you get through it?",
  "What did today teach you about yourself?",
  "Is there something you wish you'd said or done differently?",
  "What made you feel most like yourself today?",
  "What's been on your mind that you haven't said out loud yet?",
  "What small thing deserves more appreciation in your life right now?",
  "Describe the way today felt — not what happened, just how it felt.",
  "What do you need more of, and what do you need less of?",
  "Who or what supported you today, even quietly?",
  "What would feel like a win by the end of this week?",
  "What have you been avoiding, and what would happen if you didn't?",
  "What part of your day do you want to hold onto?",
  "When did you feel most calm today?",
  "What are you looking forward to tomorrow, even slightly?",
  "What does your body need right now that your mind keeps forgetting?",
  "What story are you telling yourself about how things are going?",
  "What has changed in the last month that you haven't fully processed?",
  "When did you last feel genuinely proud of yourself?",
  "What would a kind, honest friend say to you right now?",
  "What boundaries did you hold or let slip this week?",
  "What are you beginning to understand that you couldn't see before?",
  "What does care look like for you today?",
  "What would you like to remember about this chapter of your life?",
  "What feeling are you most ready to name today?",
  "What does rest actually look like for you, and did you get any?",
];

function getDailyJournalPrompt() {
  return JOURNAL_PROMPTS[Math.floor(Date.now() / 86_400_000) % JOURNAL_PROMPTS.length];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function firstSentence(text, maxLen = 140) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const end = clean.search(/[.!?]/);
  if (end > 0 && end < maxLen) return clean.slice(0, end + 1);
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.7 ? cut.slice(0, lastSpace) : cut) + '…';
}

function getEntryDate(journal) {
  if (journal.createdAt) return new Date(journal.createdAt);
  if (journal._id) return new Date(parseInt(journal._id.substring(0, 8), 16) * 1000);
  return new Date();
}

function formatRelative(date) {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ── Sentiment config ──────────────────────────────────────────────────────────

const SENTIMENT_CFG = {
  positive: {
    badge: { label: 'Positive', emoji: '😊', cls: 'bg-success-50 text-success-700' },
    insight: {
      headline: "Today's reflection shows a positive mood",
      subtext: "Something's resonating well right now. Take a moment to notice it.",
      cardCls: 'bg-success-50 border-success-200',
      headlineCls: 'text-success-800',
      subtextCls: 'text-success-700',
      iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
      iconCls: 'text-success-500',
    },
  },
  negative: {
    badge: { label: 'Difficult', emoji: '😔', cls: 'bg-error-50 text-error-600' },
    insight: {
      headline: "Today's reflection carries some weight",
      subtext: "That's completely okay. Writing about it is already a meaningful step.",
      cardCls: 'bg-error-50 border-error-200',
      headlineCls: 'text-error-800',
      subtextCls: 'text-error-700',
      iconPath: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
      iconCls: 'text-error-400',
    },
  },
  neutral: {
    badge: { label: 'Neutral', emoji: '😐', cls: 'bg-neutral-100 text-neutral-600' },
    insight: {
      headline: 'A calm, measured reflection',
      subtext: 'Steadiness has its own kind of strength. Balance is worth noticing too.',
      cardCls: 'bg-neutral-50 border-neutral-200',
      headlineCls: 'text-neutral-800',
      subtextCls: 'text-neutral-600',
      iconPath: 'M3.75 9h16.5m-16.5 6.75h16.5',
      iconCls: 'text-neutral-400',
    },
  },
};

function getSentimentCfg(sentiment) {
  return SENTIMENT_CFG[(sentiment || '').toLowerCase()] || SENTIMENT_CFG.neutral;
}

// ── Shared ────────────────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }) {
  const { badge } = getSentimentCfg(sentiment);
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium ${badge.cls}`}>
      <span aria-hidden="true">{badge.emoji}</span>
      {badge.label}
    </span>
  );
}

function Tab({ id, controls, active, onClick, children }) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={[
        'px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-150',
        active
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-neutral-500 hover:text-neutral-700',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ── Write — completion view ───────────────────────────────────────────────────

function CompletionView({ result, onWriteAnother }) {
  const { insight, badge } = getSentimentCfg(result.sentiment);
  const preview = firstSentence(result.content);

  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-label="Entry saved">
      {/* Wellness insight */}
      <aside
        className={`rounded-card border px-5 py-5 ${insight.cardCls}`}
        aria-label="Emotional insight from this entry"
      >
        <div className="flex items-start gap-4">
          <svg
            className={`h-5 w-5 shrink-0 mt-0.5 ${insight.iconCls}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={insight.iconPath} />
          </svg>
          <div className="min-w-0">
            <div className="mb-2">
              <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                <span aria-hidden="true">{badge.emoji}</span>
                {badge.label}
              </span>
            </div>
            <p className={`text-sm font-semibold ${insight.headlineCls}`}>{insight.headline}</p>
            <p className={`mt-1 text-sm leading-relaxed ${insight.subtextCls}`}>{insight.subtext}</p>
          </div>
        </div>
      </aside>

      {/* Entry preview */}
      {preview && (
        <blockquote className="border-l-4 border-neutral-200 pl-4 py-1">
          <p className="text-sm text-neutral-600 leading-relaxed">"{preview}"</p>
        </blockquote>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onWriteAnother}
          className={[
            'flex h-11 flex-1 items-center justify-center rounded-button',
            'bg-primary-500 text-sm font-semibold text-white',
            'hover:bg-primary-600 active:bg-primary-700 transition-all duration-150 shadow-primary',
            'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          ].join(' ')}
        >
          Write another entry
        </button>
        <Link
          to="/journal?tab=history"
          className={[
            'flex h-11 flex-1 items-center justify-center rounded-button',
            'border border-neutral-200 bg-white text-sm font-medium text-neutral-700',
            'hover:bg-neutral-50 transition-all duration-150',
            'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          ].join(' ')}
        >
          View in history
        </Link>
      </div>
    </div>
  );
}

// ── Write tab ─────────────────────────────────────────────────────────────────

function WriteTab({ token }) {
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(() => Date.now());
  const textareaRef = useRef(null);

  const prompt = getDailyJournalPrompt();
  const words = wordCount(content);
  const canSave = words >= 3;

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 240)}px`;
  }, [content]);

  const handleSave = async () => {
    const text = content.trim();
    if (!text || words < 3) {
      addToast('Write at least a few words before saving.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const { sentiment } = await mlService.sentimentAnalysis(text);
      await journalsService.postTime({ content: text, sentiment }, token);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      await journalsService.postTime({ journalTime: timeSpent }, token);
      setResult({ sentiment, content: text });
    } catch {
      addToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWriteAnother = () => {
    setResult(null);
    setContent('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  if (result) return <CompletionView result={result} onWriteAnother={handleWriteAnother} />;

  return (
    <div className="space-y-5">
      {/* Daily prompt */}
      <div className="rounded-card border border-primary-100 px-5 py-4" style={{ backgroundColor: 'var(--color-primary-50)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 mb-1.5">Reflection prompt</p>
        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-primary-900, #1e1b4b)' }}>{prompt}</p>
      </div>

      {/* Writing area */}
      <div
        className={[
          'rounded-card border bg-white overflow-hidden transition-all duration-150',
          'focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300',
          'border-neutral-200',
        ].join(' ')}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing here…"
          className={[
            'w-full resize-none border-0 bg-transparent px-5 py-5',
            'text-sm text-neutral-900 placeholder:text-neutral-400',
            'leading-relaxed focus:outline-none',
          ].join(' ')}
          style={{ minHeight: '240px' }}
          aria-label="Journal entry"
          aria-describedby="write-hint"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span id="write-hint" className="text-xs text-neutral-400">
          {words > 0
            ? `${words} ${words === 1 ? 'word' : 'words'}${!canSave ? ' — keep going' : ''}`
            : 'Write freely — this is just for you'}
        </span>
        <Button onClick={handleSave} loading={saving} disabled={!canSave} variant="primary" size="md">
          Save entry
        </Button>
      </div>
    </div>
  );
}

// ── History — entry card ──────────────────────────────────────────────────────

function EntryCard({ journal, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const date = getEntryDate(journal);
  const text = journal.content || '';
  const isLong = text.length > 200;
  const displayText = expanded || !isLong ? text : text.slice(0, 200).trimEnd() + '…';

  return (
    <article className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-neutral-100">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <time
              className="text-xs font-semibold text-neutral-700"
              dateTime={date.toISOString()}
            >
              {formatRelative(date)}
            </time>
            <span className="text-neutral-300 text-xs select-none" aria-hidden="true">·</span>
            <time className="text-xs text-neutral-400">{formatTime(date)}</time>
            {journal.sentiment && <SentimentBadge sentiment={journal.sentiment} />}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onEdit(journal)}
            aria-label="Edit this entry"
            className="p-1.5 rounded-button text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-150"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(journal._id)}
            aria-label="Delete this entry"
            className="p-1.5 rounded-button text-neutral-400 hover:text-error-600 hover:bg-error-50 transition-all duration-150"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{displayText}</p>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="mt-2.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            {expanded ? 'Show less' : 'Read full entry'}
          </button>
        )}
      </div>
    </article>
  );
}

// ── History — edit modal ──────────────────────────────────────────────────────

function EditModal({ journal, isOpen, onClose, token, onSaved }) {
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);
  const words = wordCount(text);

  useEffect(() => {
    if (isOpen && journal) setText(journal.content || '');
  }, [isOpen, journal]);

  // Auto-grow
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 200)}px`;
  }, [text]);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed || wordCount(trimmed) < 3) {
      addToast('Entry needs at least a few words.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const { sentiment } = await mlService.sentimentAnalysis(trimmed);
      await journalsService.remove(journal._id, token);
      await journalsService.postTime({ content: trimmed, sentiment }, token);
      addToast('Entry updated.', 'success');
      onSaved();
      onClose();
    } catch {
      addToast('Failed to update. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit entry" size="md">
      <div className="space-y-4 mt-1">
        <div
          className={[
            'rounded-input border bg-white overflow-hidden transition-all duration-150',
            'focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300',
            'border-neutral-200',
          ].join(' ')}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none border-0 bg-transparent px-4 py-3.5 text-sm text-neutral-900 leading-relaxed focus:outline-none"
            style={{ minHeight: '200px' }}
            aria-label="Edit journal entry"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {words} {words === 1 ? 'word' : 'words'}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} disabled={words < 3} onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </div>
        <p className="text-xs text-neutral-400">Saving will re-analyse the mood of this entry.</p>
      </div>
    </Modal>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({ token }) {
  const { addToast } = useToast();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  const fetchJournals = useCallback(() => {
    setLoading(true);
    journalsService
      .getAll(token)
      .then((res) => setJournals(Array.isArray(res.data) ? res.data : []))
      .catch(() => addToast('Failed to load entries.', 'error'))
      .finally(() => setLoading(false));
  }, [token, addToast]);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await journalsService.remove(deleteId, token);
      setJournals((prev) => prev.filter((j) => j._id !== deleteId));
      setDeleteId(null);
      addToast('Entry deleted.', 'success');
    } catch {
      addToast('Failed to delete entry.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="list" rows={4} />;

  if (!journals.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-4xl mb-4" aria-hidden="true">📓</p>
        <p className="text-base font-semibold text-neutral-700">No entries yet</p>
        <p className="mt-1 text-sm text-neutral-500">Your saved reflections will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-neutral-400 mb-4" aria-live="polite">
        {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
      </p>
      <ul className="space-y-3" aria-label="Journal entries">
        {journals.map((journal) => (
          <li key={journal._id}>
            <EntryCard
              journal={journal}
              onEdit={setEditingJournal}
              onDelete={setDeleteId}
            />
          </li>
        ))}
      </ul>

      <EditModal
        journal={editingJournal}
        isOpen={!!editingJournal}
        onClose={() => setEditingJournal(null)}
        token={token}
        onSaved={fetchJournals}
      />

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete entry"
        description="This reflection will be permanently removed and cannot be recovered."
        size="sm"
      >
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Journal() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'history' ? 'history' : 'write';
  const setTab = (tab) => setSearchParams(tab === 'write' ? {} : { tab });

  return (
    <div className="max-w-[720px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Journal</h1>
      <p className="text-sm text-neutral-500 mb-6">A space to reflect, feel, and find clarity.</p>

      <div
        className="flex gap-1 border-b border-neutral-200 mb-6"
        role="tablist"
        aria-label="Journal sections"
      >
        <Tab
          id="tab-write"
          controls="panel-write"
          active={activeTab === 'write'}
          onClick={() => setTab('write')}
        >
          Write
        </Tab>
        <Tab
          id="tab-history"
          controls="panel-history"
          active={activeTab === 'history'}
          onClick={() => setTab('history')}
        >
          History
        </Tab>
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'write' ? <WriteTab token={token} /> : <HistoryTab token={token} />}
      </div>
    </div>
  );
}
