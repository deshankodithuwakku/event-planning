import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const EventCreate = () => {
  const [formData, setFormData] = useState({
    E_ID: '',
    E_name: '',
    E_description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    // Fetch a new event ID
    const fetchEventId = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/events/generate-id');
        setFormData(prev => ({ ...prev, E_ID: response.data.id }));
      } catch (error) {
        enqueueSnackbar('Failed to generate Event ID', { variant: 'error' });
      } finally {
        setFetchingId(false);
      }
    };

    fetchEventId();
  }, [navigate, enqueueSnackbar]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.E_ID || !formData.E_name || !formData.E_description) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5555/api/events', formData);
      
      enqueueSnackbar('Event created successfully!', { variant: 'success' });
      // Navigate to add packages for this event
      navigate(`/admin/events/${response.data.E_ID}/packages/create`);
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to create event',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-purple-800">Create New Event</h2>
          </div>
          
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="E_ID" className="block text-sm font-medium text-gray-700 mb-1">
                Event ID (Auto-generated)
              </label>
              <input
                id="E_ID"
                name="E_ID"
                type="text"
                value={fetchingId ? "Generating ID..." : formData.E_ID}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label htmlFor="E_name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                id="E_name"
                name="E_name"
                type="text"
                value={formData.E_name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter event name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="E_description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="E_description"
                name="E_description"
                rows="4"
                value={formData.E_description}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter event description"
                required
              ></textarea>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                {loading ? 'Creating Event...' : (
                  <>
                    <FaPlus className="mr-2" /> Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventCreate;
