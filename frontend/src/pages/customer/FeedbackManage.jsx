import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './FeedbackManage.css';

const FeedbackManage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('http://localhost:5555/api/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch feedbacks', { variant: 'error' });
    }
  };

  const handleEdit = (feedback) => {
    setEditingId(feedback._id);
    setEditMessage(feedback.message);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:5555/api/feedback/${id}`, {
        message: editMessage
      });
      setEditingId(null);
      fetchFeedbacks();
      enqueueSnackbar('Feedback updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update feedback', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`http://localhost:5555/api/feedback/${id}`);
        fetchFeedbacks();
        enqueueSnackbar('Feedback deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete feedback', { variant: 'error' });
      }
    }
  };

  return (
    <div className="feedback-manage-container">
      <h2>Manage Feedbacks</h2>
      <div className="feedback-grid">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="feedback-card">
            <div className="feedback-header">
              <h3>{feedback.name}</h3>
              <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
            </div>
            {editingId === feedback._id ? (
              <div className="edit-form">
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="edit-textarea"
                />
                <div className="edit-actions">
                  <button 
                    onClick={() => handleSave(feedback._id)}
                    className="save-btn"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackManage;
