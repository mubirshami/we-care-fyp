import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import reviewsService from '../services/modules/reviews';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

// ── Star rating ───────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role={readonly ? undefined : 'group'} aria-label={readonly ? undefined : 'Star rating'}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            aria-label={readonly ? undefined : `Rate ${star} star${star !== 1 ? 's' : ''}`}
            disabled={readonly}
            className={[
              'text-2xl transition-all duration-100',
              filled ? 'text-warning-500' : 'text-neutral-300',
              !readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default',
            ].join(' ')}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

// ── Review form (write or add) ────────────────────────────────────

function ReviewForm({ initial, onSave, onCancel, submitLabel = 'Submit review' }) {
  const [description, setDescription] = useState(initial?.description || '');
  const [rating, setRating] = useState(initial?.rating || 5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ description: description.trim(), rating });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star rating */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">Your rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="review-desc" className="block text-sm font-medium text-neutral-700">
          Your experience <span className="text-error-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="review-desc"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setError(''); }}
          rows={5}
          placeholder="Tell us about your experience with We Care…"
          className={[
            'w-full rounded-input border bg-white px-4 py-3 text-sm text-neutral-900',
            'placeholder:text-neutral-400 resize-none',
            'focus:outline-none focus:ring-2 transition-all duration-150',
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-100'
              : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100',
          ].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? 'review-error' : undefined}
        />
        {error && (
          <p id="review-error" role="alert" className="text-xs text-error-600">{error}</p>
        )}
        <p className="text-xs text-neutral-400">{description.length} characters</p>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={saving} variant="primary" size="md">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

// ── Single review display ─────────────────────────────────────────

function ReviewCard({ review, onEdit }) {
  const hasAdminResponse = review.adminresponse?.trim();
  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <StarRating value={review.rating} readonly />
          <Button variant="secondary" size="sm" onClick={() => onEdit(review)}>
            Edit review
          </Button>
        </div>
        <p className="text-sm text-neutral-800 leading-relaxed">{review.description}</p>
      </div>

      {hasAdminResponse && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
            Response from We Care
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed">{review.adminresponse}</p>
        </div>
      )}
    </div>
  );
}

// ── Reviews page ──────────────────────────────────────────────────

export default function Reviews() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const [checkRes, reviewsRes] = await Promise.all([
        reviewsService.check(token),
        reviewsService.get(token),
      ]);
      setHasReviewed(checkRes.data.hasReviewed);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
    } catch {
      // If check fails, show write form
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleAdd = async (payload) => {
    await reviewsService.add(payload, token);
    addToast('Review submitted — thank you!', 'success');
    await loadReviews();
  };

  const handleUpdate = async (payload) => {
    await reviewsService.update(editingReview._id, { ...payload, adminresponse: '' }, token);
    addToast('Review updated.', 'success');
    setEditingReview(null);
    await loadReviews();
  };

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Review</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Your feedback helps us improve We Care for everyone.
      </p>

      {loading ? (
        <LoadingSkeleton variant="card" />
      ) : !hasReviewed ? (
        /* ── Write new review ── */
        <div className="rounded-card border border-neutral-200 bg-white shadow-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-neutral-800">Share your experience</h2>
            <p className="mt-1 text-sm text-neutral-500">
              How has We Care helped you on your mental wellness journey?
            </p>
          </div>
          <ReviewForm onSave={handleAdd} submitLabel="Submit review" />
        </div>
      ) : (
        /* ── Existing review(s) ── */
        <div className="space-y-5">
          <p className="text-sm text-neutral-500">
            {reviews.length === 1 ? 'Your review' : `Your ${reviews.length} reviews`}
          </p>
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} onEdit={setEditingReview} />
          ))}
        </div>
      )}

      {/* ── Edit modal ── */}
      <Modal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        title="Edit your review"
        size="md"
      >
        {editingReview && (
          <ReviewForm
            initial={editingReview}
            onSave={handleUpdate}
            onCancel={() => setEditingReview(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>
    </div>
  );
}
