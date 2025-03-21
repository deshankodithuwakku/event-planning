import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FeedbackViews.css';

const FeedbackViews = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/feedback');
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };
    fetchFeedbacks();
  }, []);

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
      <div className="feedbacks-grid">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="feedback-card">
            <div className="feedback-header">
              <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
            </div>
            <p>{feedback.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackViews;
