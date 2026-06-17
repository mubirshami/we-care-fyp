import React, { useEffect, useState } from 'react';
import reviewsService from '../../services/reviews';
import AdminShell from './AdminShell';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';

const ReviewsPanel = () => {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const fetchReviews = async (token) => {
    try {
      const response = await reviewsService.getAll(token);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews(adminToken);
  }, [adminToken]);

  const handleRespond = async (reviewId) => {
    if (!responseText.trim()) {
      addToast('Response cannot be empty', 'warning');
      return;
    }
    try {
      await reviewsService.respond(reviewId, responseText, adminToken);
      fetchReviews(adminToken);
      setRespondingId(null);
      setResponseText('');
      addToast('Response submitted', 'success');
    } catch (error) {
      console.error('Error responding to review:', error);
      addToast('Failed to submit response', 'error');
    }
  };

  const handleUpdateResponse = async (reviewId, updatedResponse) => {
    try {
      await reviewsService.updateResponse(reviewId, updatedResponse, adminToken);
      fetchReviews(adminToken);
      setSelectedReviewId(null);
      addToast('Response updated', 'success');
    } catch (error) {
      console.error('Error updating response:', error);
      addToast('Failed to update response', 'error');
    }
  };

  const showUpdateButton = (reviewId) => setSelectedReviewId(reviewId);
  const cancelUpdate = () => setSelectedReviewId(null);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <AdminShell />
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{review.userid?.name}</div>
                <div className="text-sm text-gray-600">{review.rating}/5</div>
              </div>
              <p className="mb-3">{review.description}</p>

              {review.adminresponse ? (
                <div>
                  <div className="mb-2 text-sm font-medium text-gray-700">Admin Response:</div>
                  {selectedReviewId === review._id ? (
                    <div>
                      <textarea
                        className="w-full border rounded p-2 mb-2 text-sm"
                        value={review.adminresponse}
                        onChange={(e) => {
                          const updatedResponse = e.target.value;
                          setReviews((prev) =>
                            prev.map((r) =>
                              r._id === review._id ? { ...r, adminresponse: updatedResponse } : r
                            )
                          );
                        }}
                      />
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm" onClick={() => handleUpdateResponse(review._id, review.adminresponse)}>Update</button>
                        <button className="px-3 py-1 border rounded text-sm" onClick={cancelUpdate}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2 text-sm">{review.adminresponse}</p>
                      <button className="px-3 py-1 bg-yellow-400 rounded text-sm" onClick={() => showUpdateButton(review._id)}>Update Response</button>
                    </div>
                  )}
                </div>
              ) : respondingId === review._id ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Your response:</label>
                  <textarea
                    className="w-full border rounded p-2 mb-2 text-sm"
                    rows={3}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                  />
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => handleRespond(review._id)}>Submit</button>
                    <button className="px-3 py-1 border rounded text-sm" onClick={() => { setRespondingId(null); setResponseText(''); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => { setRespondingId(review._id); setResponseText(''); }}>Respond</button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews available.</p>
      )}
    </div>
  );
};

export default ReviewsPanel;
