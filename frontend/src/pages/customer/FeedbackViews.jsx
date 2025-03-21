import { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackViews.css';

const FeedbackViews = () => {
  const [feedbacks, setFeedbacks] = useState([]);

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
      <h2>Customer Feedbacks</h2>
      <div className="feedbacks-grid">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="feedback-card">
            <div className="feedback-header">
              <h3>{feedback.name}</h3>
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
