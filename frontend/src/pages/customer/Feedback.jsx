import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaStar } from 'react-icons/fa';
import './Feedback.css';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the customer data from localStorage
      const customerData = localStorage.getItem('customerData');
      if (!customerData) {
        enqueueSnackbar('Please login to submit feedback', { variant: 'error' });
        navigate('/customer/login');
        return;
      }
      
      const { C_ID } = JSON.parse(customerData);
      const response = await axios.post('http://localhost:5555/api/feedback', { 
        message,
        customerId: C_ID,
        rating 
      });
      
      setMessage('');
      enqueueSnackbar('Feedback submitted successfully!', { variant: 'success' });
      navigate('/feedbackviews');
    } catch (error) {
      console.error('Error details:', error.response || error);
      enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
    }
  };

  return (
    <div className="feedback-container">
      <h2>Share Your Feedback</h2>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="rating-container">
          <p className="rating-label">Your Rating:</p>
          <div className="star-rating">
            {[...Array(5)].map((star, index) => {
              const ratingValue = index + 1;
              
              return (
                <label key={index}>
                  <input 
                    type="radio" 
                    name="rating" 
                    value={ratingValue} 
                    checked={ratingValue === rating}
                    onChange={() => setRating(ratingValue)}
                    className="star-radio"
                  />
                  <FaStar 
                    className="star" 
                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                    size={30} 
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>
          <p className="selected-rating">Selected Rating: {rating} of 5</p>
        </div>
        
        <div className="form-group">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your feedback here..."
            required
          />
        </div>
        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
};

export default Feedback;