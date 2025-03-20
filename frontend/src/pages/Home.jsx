import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import axios from 'axios';

const Home = () => {
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
    <div className='p-8 max-w-4xl mx-auto'>
      <div className='text-center mb-10'>
        <h1 className='text-4xl font-bold text-sky-800 mb-4'>Event Planning Made Easy</h1>
        <p className='text-xl text-gray-600'>Plan your next event with our simple and intuitive platform</p>
        
        <div className="mt-8">
          <Link 
            to="/events" 
            className="inline-block px-6 py-3 bg-sky-600 text-white font-medium rounded-md hover:bg-sky-700 transition"
          >
            View All Events
          </Link>
        </div>
      </div>
      
      <div className='bg-white rounded-lg shadow-md p-6 mb-10'>
        <div className="flex justify-between items-center mb-4">
          <h2 className='text-2xl font-semibold text-sky-700'>Featured Events</h2>
          <Link to="/events" className="text-sky-600 hover:text-sky-800 font-medium">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <p className='text-center text-gray-500'>Loading events...</p>
        ) : events.length === 0 ? (
          <p className='text-center text-gray-500'>No events available at the moment.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events.map((event) => (
              <div 
                key={event._id} 
                className='bg-sky-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer'
                onClick={() => handleEventClick(event.E_ID)}
              >
                <div className='p-4'>
                  <h3 className='text-lg font-semibold text-sky-700 mb-2'>{event.E_name}</h3>
                  <p className='text-sm text-gray-600 mb-3'>
                    {event.E_description.substring(0, 100)}
                    {event.E_description.length > 100 ? '...' : ''}
                  </p>
                  <p className='text-xs text-sky-600 font-medium'>View Details →</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Home;
