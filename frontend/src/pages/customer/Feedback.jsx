import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import './Feedback.css';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5555/api/feedback', { message, name });
      setMessage('');
      setName('');
      enqueueSnackbar('Feedback submitted successfully!', { variant: 'success' });
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error details:', error.response || error);
      enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
    }
  };

  return (
    <div className="feedback-container">
      <h2>Share Your Feedback</h2>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
          />
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