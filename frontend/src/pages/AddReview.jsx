import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewsService from '../services/modules/reviews';
import { useAuth } from '../context/AuthContext';

const AddReview = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!description.trim() || description.length < 10)
      errs.description = 'Please provide at least 10 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setError('');
    try {
      await reviewsService.add({ description, rating }, token);
      setSuccess('Review submitted successfully');
      setTimeout(() => navigate('/home'), 800);
    } catch (err) {
      console.error(err);
      setError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Submit a Review</h2>
      <form onSubmit={handleSubmit} aria-busy={loading}>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'desc-error' : undefined}
          ></textarea>
          {errors.description && (
            <p id="desc-error" className="text-sm text-red-600 mt-1">
              {errors.description}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="rating" className="block text-sm font-medium mb-1">
            Rating:
          </label>
          <select
            id="rating"
            name="rating"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value={1}>1 Star</option>
            <option value={2}>2 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={5}>5 Stars</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AddReview;
