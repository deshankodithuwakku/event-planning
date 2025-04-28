import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaUsers, FaStar, FaHeart } from 'react-icons/fa';
// Import images
import teamImage from '../assets/about/teaam.jpg';
import event1Image from '../assets/about/event1.jpg';
import event2Image from '../assets/about/event2.jpg';
import image4 from '../assets/about/image4.jpg';

/**
 * About Page Component
 * Displays information about Bloomz Event Planning, including:
 * - Company introduction and mission
 * - Team section with photo
 * - Event showcase with images
 * - Call-to-action section
 */
const About = () => {
  return (
    <div className="min-h-screen bg-sky-50">
      {/* Hero Section */}
      <div className="relative bg-sky-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Bloomz Event Planning</h1>
          <p className="text-xl text-sky-100 max-w-3xl mx-auto">
            Crafting Unforgettable Moments, One Event at a Time
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

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Our Story</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                At Bloomz Event Planning, we believe that every celebration deserves to be extraordinary. Founded with a passion for creating memorable experiences, we've been transforming ordinary moments into extraordinary memories since our inception.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Our journey began with a simple idea: to make event planning accessible, enjoyable, and truly personalized. Today, we're proud to be one of the leading event planning companies, known for our creativity, attention to detail, and commitment to excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Mission and Values Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Our Mission</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Our mission is to create exceptional events that reflect our clients' unique vision and personality. We strive to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed text-lg space-y-4">
                <li>Deliver personalized service that exceeds expectations</li>
                <li>Create memorable experiences that last a lifetime</li>
                <li>Maintain the highest standards of professionalism and creativity</li>
                <li>Build lasting relationships with our clients and partners</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Our Team</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Team Photo */}
              <div className="relative h-96 rounded-xl overflow-hidden">
                <img 
                  src={teamImage} 
                  alt="Bloomz Event Planning Team" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Team Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  Our team of experienced event planners brings together creativity, expertise, and passion. Each member of our team is dedicated to ensuring that your event is executed flawlessly, from the initial planning stages to the final celebration.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  We believe in collaboration, innovation, and attention to detail. Our diverse team brings together various skills and perspectives, allowing us to create unique and memorable experiences for our clients.
                </p>
              </div>
            </div>
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

        {/* Event Showcase */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Our Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Event 1 */}
              <div className="relative h-64 rounded-xl overflow-hidden group">
                <img 
                  src={event2Image} 
                  alt="Wedding Event" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">Weddings</h3>
                </div>
              </div>
              {/* Event 2 */}
              <div className="relative h-64 rounded-xl overflow-hidden group">
                <img 
                  src={event1Image} 
                  alt="Corporate Event" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">Corporate Events</h3>
                </div>
              </div>
              {/* Event 3 - Birthday Party with new image */}
              <div className="relative h-64 rounded-xl overflow-hidden group">
                <img 
                  src={image4} 
                  alt="Birthday Party" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">Birthday Parties</h3>
                </div>
              </div>
            </div>
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

export default About; 