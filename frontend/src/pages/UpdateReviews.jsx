import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import reviewsService from '../services/modules/reviews';

function UpdateReviews() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [updatedReview, setUpdatedReview] = useState('');
  const [updatedRating, setUpdatedRating] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewsService.get(token);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [token]);

  const checkReviewStatus = useCallback(async () => {
    try {
      const response = await reviewsService.check(token);
      setHasReviewed(response.data.hasReviewed);
      if (!response.data.hasReviewed) navigate('/addreview');
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchReviews();
    checkReviewStatus();
  }, [fetchReviews, checkReviewStatus]);

  const openModal = (id, description, rating) => {
    setSelectedReviewId(id);
    setUpdatedReview(description);
    setUpdatedRating(rating);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleUpdate = async () => {
    try {
      const updatedData = { description: updatedReview, rating: updatedRating, adminresponse: '' };
      const response = await reviewsService.update(selectedReviewId, updatedData, token);
      setReviews((prev) => prev.map((r) => (r._id === selectedReviewId ? response.data : r)));
      closeModal();
      addToast('Review updated successfully', 'success');
    } catch (error) {
      console.error(error.response || error);
      addToast('Failed to update review', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">My Reviews</h1>
      {hasReviewed ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="p-4 border rounded">
              <div className="mb-2">{review.description}</div>
              <div className="text-sm text-gray-600 mb-2">Rating: {review.rating}</div>
              {review.adminresponse?.trim() !== '' && (
                <div className="text-sm text-gray-700">Admin Response: {review.adminresponse}</div>
              )}
              <div className="mt-3">
                <button
                  className="px-3 py-1 bg-yellow-400 rounded"
                  onClick={() => openModal(review._id, review.description, review.rating)}
                >
                  Update
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p>You haven't written any reviews yet.</p>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => navigate('/addreview')}
          >
            Write a Review
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-3">Update Review</h2>
            <label className="block mb-2">
              Description:
              <input
                type="text"
                value={updatedReview}
                onChange={(e) => setUpdatedReview(e.target.value)}
                className="w-full border rounded px-2 py-1 mt-1"
              />
            </label>
            <label className="block mb-4">
              Rating:
              <select
                value={updatedRating}
                onChange={(e) => setUpdatedRating(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={closeModal}>
                Cancel
              </button>
              <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateReviews;
