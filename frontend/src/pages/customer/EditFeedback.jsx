import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const EditFeedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:5555/api/feedback/${feedbackId}`);
        
        if (response.data) {
          setFeedback(response.data);
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        const errorMsg = error.response?.data?.message || 
                        error.response?.status === 404 ? 'Feedback not found' :
                        'Failed to fetch feedback';
        setError(errorMsg);
        enqueueSnackbar(errorMsg, { 
          variant: 'error',
          autoHideDuration: 3000
        });
        // Delay navigation to show the error message
        setTimeout(() => {
          navigate('/customer/feedback-manage');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchFeedback();
    }
  }, [feedbackId, navigate, enqueueSnackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }
      
      const response = await axios.put(`http://localhost:5555/api/feedback/${feedbackId}`, {
        message: message.trim()
      });

      if (response.data.status === 'success') {
        enqueueSnackbar('Feedback updated successfully', { variant: 'success' });
        navigate('/customer/feedback-manage');
      } else {
        throw new Error(response.data.message || 'Failed to update feedback');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update feedback';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading feedback...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate('/customer/feedback-manage')}
        className="flex items-center text-blue-600 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Feedbacks
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="6"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFeedback;
