import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPinterest } from 'react-icons/fa';

/**
 * Contact Page Component
 * Displays contact information and social media links for Bloomz Event Planning
 * Includes a hero section, contact details, and social media platform links
 */
const Contact = () => {
  return (
    // Main container with minimum height and light blue background
    <div className="min-h-screen bg-sky-50">
      {/* Hero Section with dark overlay */}
      <div className="relative bg-sky-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-sky-100 max-w-3xl mx-auto">
            We'd Love to Hear From You!
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back to Home Navigation Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sky-600 hover:text-sky-800 mb-8 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Contact Message Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Get in Touch</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Planning something special? Have questions or need a custom quote? The Bloomz Event Planning team is here to help! Whether you're ready to start organizing your big day or just exploring ideas, we're just a message away.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Email Contact Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaEnvelope />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Us</h3>
            <p className="text-gray-600">info@bloomzevents.com</p>
          </div>

          {/* Phone Contact Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaPhone />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Call Us</h3>
            <p className="text-gray-600">+94 (011) 225-9846</p>
          </div>

          {/* Address Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Visit Us</h3>
            <p className="text-gray-600">No 21, World Trade Center, Colombo, Sri lanka</p>
          </div>

          {/* Business Hours Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-sky-600 text-3xl mb-4">
              <FaClock />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Business Hours</h3>
            <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-800 mb-6 text-center">Connect With Us</h2>
            <p className="text-gray-700 text-lg mb-8 text-center">
              Follow us on social media for event inspiration, planning tips, and the latest updates from Bloomz Event Planning.
            </p>
            
            {/* Social Media Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {/* Facebook Link */}
              <a 
                href="https://facebook.com/bloomzevents" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition duration-300 transform hover:scale-105"
              >
                <FaFacebook className="text-blue-600 text-4xl mb-3" />
                <span className="text-blue-800 font-medium">Facebook</span>
              </a>
              
              {/* Twitter Link */}
              <a 
                href="https://twitter.com/bloomzevents" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition duration-300 transform hover:scale-105"
              >
                <FaTwitter className="text-sky-500 text-4xl mb-3" />
                <span className="text-sky-700 font-medium">Twitter</span>
              </a>
              
              {/* Instagram Link */}
              <a 
                href="https://instagram.com/bloomzevents" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-pink-50 rounded-xl hover:bg-pink-100 transition duration-300 transform hover:scale-105"
              >
                <FaInstagram className="text-pink-600 text-4xl mb-3" />
                <span className="text-pink-700 font-medium">Instagram</span>
              </a>
              
              {/* LinkedIn Link */}
              <a 
                href="https://linkedin.com/company/bloomzevents" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition duration-300 transform hover:scale-105"
              >
                <FaLinkedin className="text-blue-700 text-4xl mb-3" />
                <span className="text-blue-800 font-medium">LinkedIn</span>
              </a>
              
              {/* Pinterest Link */}
              <a 
                href="https://pinterest.com/bloomzevents" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-red-50 rounded-xl hover:bg-red-100 transition duration-300 transform hover:scale-105"
              >
                <FaPinterest className="text-red-600 text-4xl mb-3" />
                <span className="text-red-700 font-medium">Pinterest</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 