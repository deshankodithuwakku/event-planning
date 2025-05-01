import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

/**
 * EventCreate Component
 * Handles the creation of new events in the system
 * 
 * CRUD Operations:
 * - Create: Implements event creation with validation
 * 
 * Validations:
 * - Required fields: Event ID, Name, and Description
 * - Server-side validation through API
 * - Client-side form validation
 * - Authentication check for admin access
 * 
 * State Management:
 * - formData: Manages form input values
 * - loading: Tracks form submission state
 * - fetchingId: Tracks ID generation state
 */
const EventCreate = () => {
  // Form state management
  const [formData, setFormData] = useState({
    E_ID: '',
    E_name: '',
    E_description: '',
    status: 'active'
  });
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const [nameError, setNameError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  /**
   * Initial setup effect
   * - Checks admin authentication
   * - Generates new event ID
   */
  useEffect(() => {
    // Authentication validation
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    // Generate new event ID
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

  /**
   * Handles form input changes
   * Updates formData state with new values
   * Validates that Event Name contains only letters
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'E_name') {
      // Validate for letters only using regex
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        setNameError('Event name can only contain letters');
        return;
      } else {
        setNameError('');
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  /**
   * Handles form submission
   * Includes validation and API call for event creation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.E_ID || !formData.E_name || !formData.E_description || !formData.status) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    // Validate event name (minimum 3 characters and letters only)
    if (formData.E_name.length < 3) {
      enqueueSnackbar('Event name must be at least 3 characters long', { variant: 'error' });
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.E_name)) {
      enqueueSnackbar('Event name can only contain letters', { variant: 'error' });
      return;
    }

    // Validate description (minimum 10 characters)
    if (formData.E_description.length < 10) {
      enqueueSnackbar('Description must be at least 10 characters long', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // API call for event creation
      const response = await axios.post('http://localhost:5555/api/events', formData);
      
      enqueueSnackbar('Event created successfully!', { variant: 'success' });
      // Navigate to add packages for this event
      navigate(`/admin/events/${response.data.E_ID}/packages/create`);
    } catch (error) {
      // Error handling with user feedback
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
        {/* Navigation button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        {/* Form container */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-purple-800">Create New Event</h2>
          </div>
          
          {/* Event creation form */}
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Event ID field (auto-generated) */}
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
            
            {/* Event Name field */}
            <div>
              <label htmlFor="E_name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name * (letters only)
              </label>
              <input
                id="E_name"
                name="E_name"
                type="text"
                value={formData.E_name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                placeholder="Enter event name (letters only)"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>
            
            {/* Event Description field */}
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
            
            {/* Status field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="active">Active</option>
                <option value="ongoing">Ongoing</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            {/* Submit button */}
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
