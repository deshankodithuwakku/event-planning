import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import './FeedbackViews.css';

const FeedbackViews = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5555/api/feedback');
        setFeedbacks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setError('Failed to load feedbacks. Please try again later.');
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar 
        key={index}
        className="star"
        color={index < rating ? "#ffc107" : "#e4e5e9"}
        size={16}
      />
    ));
  };

  if (loading) {
    return (
      <div className="feedbacks-container">
        <div className="text-center py-10">
          <p className="text-gray-600">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedbacks-container">
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedbacks-container">
      <div className="flex justify-between items-center mb-6">
        <h2>Customer Feedbacks</h2>
        <button
          onClick={() => navigate('/feedback')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Feedback
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No feedbacks yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="feedbacks-grid">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="feedback-card">
              <div className="feedback-header">
                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="rating-display">
                {renderStars(feedback.rating || 0)}
                <span className="rating-text">{feedback.rating || 0}/5</span>
              </div>
              <p className="feedback-message">{feedback.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackViews;
