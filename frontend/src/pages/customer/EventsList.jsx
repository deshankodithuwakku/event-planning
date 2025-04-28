import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCalendarAlt, FaUsers, FaStar, FaHeart } from 'react-icons/fa';

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

  // Function to get a random gradient background for event cards
  const getRandomGradient = () => {
    const gradients = [
      'from-sky-400 to-blue-500',
      'from-purple-400 to-indigo-500',
      'from-pink-400 to-rose-500',
      'from-emerald-400 to-teal-500',
      'from-amber-400 to-orange-500',
      'from-cyan-400 to-blue-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Hero Section */}
      <div className="relative bg-sky-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Events</h1>
          <p className="text-xl text-sky-100 max-w-3xl mx-auto">
            Discover Our Exclusive Event Packages
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sky-600 hover:text-sky-800 mb-8 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Events Grid */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Available Events</h2>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No events available at the moment.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div 
                    key={event._id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => handleEventClick(event.E_ID)}
                  >
                    {/* Event Image Placeholder with Gradient */}
                    <div className={`h-48 bg-gradient-to-r ${getRandomGradient()} flex items-center justify-center`}>
                      <FaCalendarAlt className="text-white text-5xl opacity-80" />
                    </div>
                    
                    <div className="p-6">
                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-sky-800 mb-3">{event.E_name}</h3>
                      
                      {/* Event Description */}
                      <p className="text-gray-600 mb-6 line-clamp-3">{event.E_description}</p>
                      
                      {/* View Details Button */}
                      <div className="flex justify-end">
                        <span className="text-sky-600 font-medium text-sm group-hover:text-sky-800 flex items-center">
                          View Details 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaCalendarAlt />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Planning</h3>
            <p className="text-gray-600">Meticulous attention to every detail ensures your event runs smoothly.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaUsers />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dedicated Team</h3>
            <p className="text-gray-600">Our experienced professionals are committed to your success.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaStar />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Service</h3>
            <p className="text-gray-600">We deliver excellence in every aspect of your event.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaHeart />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Touch</h3>
            <p className="text-gray-600">Your vision is our priority, with personalized attention throughout.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-sky-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Plan Your Event?</h2>
            <p className="text-sky-100 text-lg mb-8 max-w-2xl mx-auto">
              Let us help you create the perfect event that reflects your style and meets your needs. Contact us today to start planning your next celebration.
            </p>
            <Link 
              to="/contact" 
              className="inline-block bg-white text-sky-800 px-8 py-3 rounded-lg font-semibold hover:bg-sky-50 transition duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsList;
