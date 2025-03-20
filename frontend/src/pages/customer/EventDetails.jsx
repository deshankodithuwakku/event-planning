import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5555/api/events/${eventId}`);
        setEvent(eventResponse.data);
        
        // Fetch packages for this event
        const packagesResponse = await axios.get(`http://localhost:5555/api/packages/event/${eventId}`);
        setPackages(packagesResponse.data.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleProceedToBooking = () => {
    if (!selectedPackage) {
      alert('Please select a package first');
      return;
    }
    // Navigate to payment page with event and package details
    navigate('/payment', { 
      state: { 
        event, 
        selectedPackage 
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-sky-600 hover:text-sky-800 mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back to Events
          </button>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-xl text-gray-700">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center text-sky-600 hover:text-sky-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Events
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-sky-800">{event.E_name}</h1>
            <p className="text-sm text-gray-500 mt-1">Event ID: {event.E_ID}</p>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.E_description}</p>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-sky-800">Available Packages</h2>
            <p className="text-gray-600 mt-1">Select the package that best fits your needs</p>
          </div>
          
          {packages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No packages available for this event yet.
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {packages.map((pkg) => (
                  <div 
                    key={pkg._id} 
                    className={`border ${selectedPackage && selectedPackage._id === pkg._id 
                      ? 'border-sky-500 ring-2 ring-sky-200' 
                      : 'border-gray-200'} 
                      rounded-lg p-5 hover:shadow-md transition cursor-pointer`}
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    <h3 className="text-lg font-semibold text-sky-700 mb-2">Package ID: {pkg.Pg_ID}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-2xl font-bold text-sky-600">${pkg.Pg_price}</span>
                      <div 
                        className={`px-3 py-1 rounded-full ${selectedPackage && selectedPackage._id === pkg._id 
                          ? 'bg-sky-100 text-sky-800' 
                          : 'bg-gray-100 text-gray-800'}`}
                      >
                        {selectedPackage && selectedPackage._id === pkg._id ? 'Selected' : 'Select'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPackage && (
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleProceedToBooking}
                    className="px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition font-medium"
                  >
                    Proceed to Booking
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
