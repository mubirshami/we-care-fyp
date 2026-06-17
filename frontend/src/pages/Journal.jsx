import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import journalsService from '../services/modules/journals';
import mlService from '../services/modules/ml';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

// ── Helpers ───────────────────────────────────────────────────────

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(html) {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function getEntryDate(journal) {
  if (journal.createdAt) return new Date(journal.createdAt);
  if (journal._id) return new Date(parseInt(journal._id.substring(0, 8), 16) * 1000);
  return new Date();
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Sentiment display ─────────────────────────────────────────────

const SENTIMENT = {
  positive: { label: 'Positive', emoji: '😊', cls: 'bg-success-50 text-success-700 border-success-200' },
  negative: { label: 'Negative', emoji: '😔', cls: 'bg-error-50 text-error-600 border-error-200' },
  neutral:  { label: 'Neutral',  emoji: '😐', cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

function SentimentBadge({ sentiment, size = 'sm' }) {
  const key = (sentiment || '').toLowerCase();
  const cfg = SENTIMENT[key] || SENTIMENT.neutral;
  const dim = size === 'lg'
    ? 'rounded-card border px-5 py-3 text-sm font-semibold'
    : 'rounded-pill px-2.5 py-0.5 text-xs font-medium';
  return (
    <span className={`inline-flex items-center gap-1.5 ${dim} ${cfg.cls}`}>
      <span aria-hidden="true" className={size === 'lg' ? 'text-xl' : ''}>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

// ── Tab button ────────────────────────────────────────────────────

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
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

// ── Write tab ─────────────────────────────────────────────────────

function WriteTab({ token }) {
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { sentiment: string }
  const [startTime] = useState(() => Date.now());

  const words = wordCount(content);
  const canSave = words >= 3;

  const handleSave = async () => {
    const stripped = stripHtml(content).trim();
    if (!stripped || words < 3) {
      addToast('Write at least a few words before saving.', 'warning');
      return;
    }

    setSaving(true);
    setResult(null);
    try {
      const { sentiment } = await mlService.sentimentAnalysis(stripped);
      await journalsService.postTime({ content: stripped, sentiment }, token);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      await journalsService.postTime({ journalTime: timeSpent }, token);
      setResult({ sentiment });
      setContent('');
      addToast('Journal entry saved.', 'success');
    } catch {
      addToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sentiment result */}
      {result && (
        <div className="flex items-center gap-4 rounded-card border border-success-200 bg-success-50 p-5">
          <div>
            <p className="text-sm font-semibold text-success-700">Entry saved!</p>
            <p className="mt-0.5 text-xs text-success-600">Your entry was detected as:</p>
          </div>
          <SentimentBadge sentiment={result.sentiment} size="lg" />
        </div>
      )}

      {/* Prompt */}
      <div className="rounded-card border border-neutral-100 bg-neutral-50 px-5 py-4">
        <p className="text-sm font-medium text-neutral-600">
          ✍️ <span className="font-semibold text-neutral-800">Today's prompt:</span>{' '}
          What is one thing that happened today that you'd like to remember?
        </p>
      </div>

      {/* Editor */}
      <div className="rounded-card border border-neutral-200 overflow-hidden">
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_KEY}
          value={content}
          onEditorChange={(val) => { setContent(val); if (result) setResult(null); }}
          init={{
            height: 380,
            menubar: false,
            statusbar: false,
            plugins: ['lists', 'link', 'searchreplace', 'wordcount'],
            toolbar: 'undo redo | bold italic | bullist numlist | link',
            content_style: [
              "body { font-family: 'Inter', system-ui, sans-serif; font-size: 15px;",
              "line-height: 1.7; color: #292524; padding: 16px; }",
            ].join(' '),
            skin: 'oxide',
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {words} {words === 1 ? 'word' : 'words'}
          {!canSave && words > 0 && ' — write a bit more'}
        </span>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!canSave}
          variant="primary"
          size="md"
        >
          Save entry
        </Button>
      </div>
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────

function HistoryTab({ token }) {
  const { addToast } = useToast();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJournals = useCallback(() => {
    setLoading(true);
    journalsService
      .getAll(token)
      .then((res) => setJournals(Array.isArray(res.data) ? res.data : []))
      .catch(() => addToast('Failed to load journals.', 'error'))
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
        <p className="mt-1 text-sm text-neutral-500">
          Your saved journal entries will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-neutral-500 mb-4">{journals.length} {journals.length === 1 ? 'entry' : 'entries'}</p>
      <ul className="space-y-3">
        {journals.map((journal) => {
          const date = getEntryDate(journal);
          const snippet = (journal.content || '').slice(0, 200).trim();
          return (
            <li key={journal._id} className="rounded-card border border-neutral-200 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <time className="text-xs font-medium text-neutral-500" dateTime={date.toISOString()}>
                      {formatDate(date)}
                    </time>
                    {journal.sentiment && <SentimentBadge sentiment={journal.sentiment} />}
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {snippet}{journal.content?.length > 200 ? '…' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(journal._id)}
                  aria-label="Delete entry"
                  className="shrink-0 text-neutral-400 hover:text-error-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete entry"
        description="This entry will be permanently removed and cannot be recovered."
        size="sm"
      >
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

// ── Journal page ──────────────────────────────────────────────────

export default function Journal() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'history' ? 'history' : 'write';

  const setTab = (tab) => setSearchParams(tab === 'write' ? {} : { tab });

  return (
    <div className="max-w-[780px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Journal</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Write freely, track your emotions, and revisit past entries.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6" role="tablist" aria-label="Journal sections">
        <Tab active={activeTab === 'write'} onClick={() => setTab('write')}>
          ✍️ Write
        </Tab>
        <Tab active={activeTab === 'history'} onClick={() => setTab('history')}>
          📖 History
        </Tab>
      </div>

      {/* Tab panels */}
      <div role="tabpanel">
        {activeTab === 'write' ? (
          <WriteTab token={token} />
        ) : (
          <HistoryTab token={token} />
        )}
      </div>
    </div>
  );
}
