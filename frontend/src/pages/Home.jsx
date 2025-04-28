import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import coverPhoto from '../assets/cover-photo.jpg';

/**
 * Home Page Component
 * Main landing page for Bloomz Event Planning featuring:
 * - Hero section with background image
 * - Featured events section
 * - Services overview
 * - Call-to-action sections
 */
const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with background image and overlay */}
      <div className="relative h-screen">
        {/* Background image with blur effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${coverPhoto})`,
            filter: 'blur(3px)'
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Hero content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover your Event
            </h1>
            <p className="text-xl md:text-2xl text-sky-100 mb-8">
              Create Unforgettable Moments with Bloomz Event Planning
            </p>
            <Link 
              to="/events" 
              className="inline-flex items-center px-8 py-4 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition duration-300 transform hover:scale-105"
            >
              View
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Description Section */}
        <div className="text-center mb-16">
          <p className="text-2xl md:text-3xl text-sky-800 font-medium mb-4">
            We are planning your all kind of events
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From intimate birthday celebrations to grand corporate gatherings, we specialize in creating unforgettable experiences. Our expert team handles everything from venue selection to entertainment, ensuring your event is executed flawlessly.
          </p>
        </div>

        {/* Services Overview Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-sky-800 mb-8 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Event Planning Service */}
            <div className="text-center">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-sky-600">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Event Planning</h3>
              <p className="text-gray-600">
                From concept to execution, we handle every detail of your event with precision and creativity. Our expert team ensures a seamless experience tailored to your vision.
              </p>
            </div>

            {/* Venue Selection Service */}
            <div className="text-center">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-sky-600">🏛️</span>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Venue Selection</h3>
              <p className="text-gray-600">
                Access to exclusive venues and locations for your special occasion
              </p>
            </div>

            {/* Catering Service */}
            <div className="text-center">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-sky-600">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Catering</h3>
              <p className="text-gray-600">
                Customized menu planning and professional catering services
              </p>
            </div>

            {/* Entertainment Service */}
            <div className="text-center">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-sky-600">🎵</span>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Entertainment</h3>
              <p className="text-gray-600">
                Curated entertainment options to match your event theme
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-sky-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Planning?</h2>
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

export default Home;
