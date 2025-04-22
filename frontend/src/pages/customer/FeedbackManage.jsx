import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import './FeedbackManage.css';

const FeedbackManage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const customerData = localStorage.getItem('customerData');
    if (!customerData) {
      enqueueSnackbar('Please login to manage feedback', { variant: 'error' });
      navigate('/customer/login');
      return;
    }
    
    const { C_ID } = JSON.parse(customerData);
    setCurrentUserId(C_ID);
    
    fetchFeedbacks();
  }, [navigate, enqueueSnackbar]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5555/api/feedback');
      setFeedbacks(response.data);
      setLoading(false);
    } catch (error) {
      enqueueSnackbar('Failed to fetch feedbacks', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    navigate(`/customer/feedback/edit/${feedback._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5555/api/feedback/${id}`, {
          data: { customerId: currentUserId }
        });
        
        if (response.data.status === 'success') {
          // Remove from local state
          setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
          enqueueSnackbar('Feedback deleted successfully', { 
            variant: 'success',
            autoHideDuration: 3000
          });
        } else {
          throw new Error(response.data.message || 'Error deleting feedback');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Failed to delete feedback';
        enqueueSnackbar(errorMessage, { 
          variant: 'error',
          autoHideDuration: 4000
        });
        console.error('Delete feedback error:', error);
      }
    }
  };

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
      <div className="feedback-manage-container">
        <h2>Manage Feedbacks</h2>
        <div className="text-center py-10">
          <p className="text-gray-600">Loading your feedbacks...</p>
        </div>
      </div>
    );
  }

  // Filter feedbacks to show only user's own feedbacks
  const userFeedbacks = feedbacks.filter(feedback => feedback.customerId === currentUserId);

  return (
    <div className="feedback-manage-container">
      <h2>Manage Feedbacks</h2>
      
      {userFeedbacks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">You haven't submitted any feedback yet.</p>
          <button 
            onClick={() => navigate('/feedback')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create Feedback
          </button>
        </div>
      ) : (
        <div className="feedback-grid">
          {userFeedbacks.map((feedback) => (
            <div key={feedback._id} className="feedback-card">
              <div className="feedback-header">
                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="rating-display mb-2">
                {renderStars(feedback.rating || 0)}
                <span className="rating-text ml-2">{feedback.rating || 0}/5</span>
              </div>
              <p>{feedback.message}</p>
              <div className="card-actions">
                <button 
                  onClick={() => handleEdit(feedback)}
                  className="edit-btn"
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(feedback._id)}
                  className="delete-btn"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackManage;
