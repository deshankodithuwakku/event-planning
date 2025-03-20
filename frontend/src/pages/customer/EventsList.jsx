import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/events');
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-sky-600 hover:text-sky-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-sky-800">All Events</h2>
            <p className="text-gray-600 mt-1">Browse and select from our available events</p>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No events available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {events.map((event) => (
                <div 
                  key={event._id}
                  className="bg-sky-50 rounded-lg overflow-hidden shadow hover:shadow-md transition cursor-pointer"
                  onClick={() => handleEventClick(event.E_ID)}
                >
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-sky-700 mb-2">{event.E_name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.E_description}</p>
                    <div className="flex justify-end">
                      <span className="text-sky-600 font-medium text-sm">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsList;
