import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaCaretDown } from 'react-icons/fa';
import { MdEventAvailable } from 'react-icons/md';

const Header = () => {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

  return (
    <header className="bg-gradient-to-r from-sky-800 to-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and site name */}
          <Link to="/" className="flex items-center space-x-2">
            <MdEventAvailable className="text-white text-3xl" />
            <span className="text-white text-xl font-bold">EventPro</span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-sky-200 transition">Home</Link>
            <Link to="/events" className="text-white hover:text-sky-200 transition">Events</Link>
            <Link to="/about" className="text-white hover:text-sky-200 transition">About</Link>
            <Link to="/contact" className="text-white hover:text-sky-200 transition">Contact</Link>
          </nav>

          {/* Auth dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              className="flex items-center space-x-1 text-white px-4 py-2 rounded-full bg-sky-700 hover:bg-sky-600 transition"
            >
              <FaUserCircle />
              <span>Account</span>
              <FaCaretDown className={`transition-transform duration-300 ${showAuthDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {showAuthDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-lg font-medium text-gray-800">Customer</p>
                  <div className="flex mt-2 space-x-2">
                    <Link 
                      to="/customer/login" 
                      className="flex-1 text-center px-3 py-1.5 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/customer/register" 
                      className="flex-1 text-center px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      Register
                    </Link>
                  </div>
                </div>
                <div className="px-4 py-2">
                  <p className="text-lg font-medium text-gray-800">Admin</p>
                  <div className="flex mt-2 space-x-2">
                    <Link 
                      to="/admin/login" 
                      className="flex-1 text-center px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/admin/register" 
                      className="flex-1 text-center px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
