import React from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';

const Home = () => {
  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <div className='text-center mb-10'>
        <h1 className='text-4xl font-bold text-sky-800 mb-4'>Event Planning Made Easy</h1>
        <p className='text-xl text-gray-600'>Plan your next event with our simple and intuitive platform</p>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10'>
        <div className='bg-sky-100 p-6 rounded-lg shadow-md'>
          <h2 className='text-2xl font-semibold text-sky-700 mb-3'>Upcoming Events</h2>
          <p className='mb-4'>View and manage all your upcoming events in one place.</p>
          <Link to='/events' className='text-sky-600 hover:text-sky-800 font-medium'>
            Browse Events →
          </Link>
        </div>
        
        <div className='bg-sky-100 p-6 rounded-lg shadow-md'>
          <h2 className='text-2xl font-semibold text-sky-700 mb-3'>Create New Event</h2>
          <p className='mb-4'>Start planning your next event with our easy-to-use tools.</p>
          <Link to='/events/create' className='flex items-center text-sky-600 hover:text-sky-800 font-medium'>
            <MdOutlineAddBox className='mr-1' /> Create Event
          </Link>
        </div>
      </div>
      
      <div className='bg-sky-50 p-6 rounded-lg'>
        <h2 className='text-2xl font-semibold text-sky-700 mb-3'>Why Use Our Platform?</h2>
        <ul className='list-disc pl-5 space-y-2'>
          <li>Easy event creation and management</li>
          <li>Invite and track guests seamlessly</li>
          <li>Custom event pages and themes</li>
          <li>Budget tracking and vendor management</li>
        </ul>
      </div>
    </div>
  );
};
export default Home;
