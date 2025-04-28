import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

/**
 * EventEdit Component
 * Handles the updating of existing events in the system
 * 
 * CRUD Operations:
 * - Read: Fetches existing event details
 * - Update: Implements event update with validation
 * 
 * Validations:
 * - Required fields: Event Name and Description
 * - Server-side validation through API
 * - Client-side form validation
 * - Authentication check for admin access
 * - Event existence validation
 * 
 * State Management:
 * - formData: Manages form input values
 * - loading: Tracks form submission state
 * - fetchingEvent: Tracks event data loading state
 */
const EventEdit = () => {
  // Get event ID from URL parameters
  const { eventId } = useParams();
  
  // Form state management
  const [formData, setFormData] = useState({
    E_name: '',
    E_description: ''
  });
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  /**
   * Initial setup effect
   * - Checks admin authentication
   * - Fetches existing event data
   */
  useEffect(() => {
    // Authentication validation
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    // Fetch existing event data
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5555/api/events/${eventId}`);
        const event = response.data;
        
        setFormData({
          E_name: event.E_name,
          E_description: event.E_description
        });
      } catch (error) {
        enqueueSnackbar('Failed to fetch event details', { variant: 'error' });
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate, enqueueSnackbar]);

  /**
   * Handles form input changes
   * Updates formData state with new values
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handles form submission
   * Includes validation and API call for event update
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.E_name || !formData.E_description) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // API call for event update
      await axios.put(`http://localhost:5555/api/events/${eventId}`, formData);
      
      enqueueSnackbar('Event updated successfully!', { variant: 'success' });
      navigate(`/admin/events/${eventId}`);
    } catch (error) {
      // Error handling with user feedback
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update event',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state display
  if (fetchingEvent) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation button */}
        <button
          onClick={() => navigate(`/admin/events/${eventId}`)}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Event
        </button>
        
        {/* Form container */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-purple-800">Edit Event</h2>
          </div>
          
          {/* Event edit form */}
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Event Name field */}
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
            
            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                {loading ? 'Updating Event...' : (
                  <>
                    <FaSave className="mr-2" /> Save Changes
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

export default EventEdit;
