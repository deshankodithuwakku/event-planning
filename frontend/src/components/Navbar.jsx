import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-sky-900">EventPro</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-sky-600 transition">
              Home
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-sky-600 transition">
              Events
            </Link>
            <Link to="/packages" className="text-gray-700 hover:text-sky-600 transition">
              Packages
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-sky-600 transition">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sky-600 hover:text-sky-700 transition"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-sky-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 