import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaPlus } from 'react-icons/fa';

/**
 * EventView Component
 * Handles the viewing of event details and associated packages
 * 
 * CRUD Operations:
 * - Read: Fetches and displays event details and packages
 * 
 * Validations:
 * - Authentication check for admin access
 * - Event existence validation
 * - Error handling for failed API calls
 * 
 * State Management:
 * - event: Stores event details
 * - packages: Stores associated packages
 * - loading: Tracks data loading state
 */
const EventView = () => {
  // Get event ID from URL parameters
  const { eventId } = useParams();
  
  // State management for event data
  const [event, setEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  /**
   * Initial setup effect
   * - Checks admin authentication
   * - Fetches event and package data
   */
  useEffect(() => {
    // Authentication validation
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    fetchEventDetails();
  }, [eventId, navigate]);

  /**
   * Fetches event details and associated packages
   * Handles error cases and loading states
   */
  const fetchEventDetails = async () => {
    try {
      // Fetch event details
      const eventResponse = await axios.get(`http://localhost:5555/api/events/${eventId}`);
      setEvent(eventResponse.data);
      
      // Fetch associated packages
      const packagesResponse = await axios.get(`http://localhost:5555/api/packages/event/${eventId}`);
      setPackages(packagesResponse.data.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch event details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Loading state display
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  // Event not found display
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-center text-lg text-gray-700">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

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
        
        {/* Event details section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-purple-800">Event Details</h2>
            <Link
              to={`/admin/events/edit/${eventId}`}
              className="flex items-center text-purple-600 hover:text-purple-800"
            >
              <FaEdit className="mr-1" /> Edit
            </Link>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.E_name}</h1>
                <p className="text-sm text-gray-500 mb-4">ID: {event.E_ID}</p>
                <p className="text-gray-700 mb-4">{event.E_description}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Packages section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Packages</h2>
            <Link
              to={`/admin/events/${eventId}/packages/create`}
              className="flex items-center text-purple-600 hover:text-purple-800"
            >
              <FaPlus className="mr-1" /> Add Package
            </Link>
          </div>
          
          {/* Packages list or empty state */}
          {packages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No packages have been created for this event yet.
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.map((pkg) => (
                    <tr key={pkg._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pkg.Pg_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                          ${pkg.Pg_price}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventView;
