import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { MdEventAvailable } from 'react-icons/md';

const Header = () => {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const customerData = localStorage.getItem('customerData');
    if (customerData) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(customerData));
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    setIsLoggedIn(false);
    setUserInfo(null);
    setShowAuthDropdown(false);
    window.location.href = '/'; // Refresh the page to update state
  };

  return (
    <header className="bg-gradient-to-r from-sky-800 to-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and site name */}
          <Link to="/" className="flex items-center space-x-2">
            <MdEventAvailable className="text-white text-3xl" />
            <span className="text-white text-xl font-bold">Bloomz (pvt) Ltd.</span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-sky-200 transition">Home</Link>
            <Link to="/events" className="text-white hover:text-sky-200 transition">Events</Link>
            <Link to="/about" className="text-white hover:text-sky-200 transition">About</Link>
            <Link to="/contact" className="text-white hover:text-sky-200 transition">Contact</Link>
            <Link to="/feedbackviews" className="text-white hover:text-sky-200 transition">Feedback</Link>
            {isLoggedIn && (
              <Link to="/customer/profile" className="text-white hover:text-sky-200 transition">Profile</Link>
            )}
          </nav>

          {/* Auth dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              className="flex items-center space-x-1 text-white px-4 py-2 rounded-full bg-sky-700 hover:bg-sky-600 transition"
            >
              <FaUserCircle />
              <span>{isLoggedIn ? userInfo?.userName || 'Account' : 'Account'}</span>
              <FaCaretDown className={`transition-transform duration-300 ${showAuthDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {showAuthDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-20">
                {isLoggedIn ? (
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-sky-100 p-2 rounded-full">
                        <FaUser className="text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium">{userInfo?.userName}</p>
                        <p className="text-xs text-gray-500">{userInfo?.C_ID}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link 
                        to="/customer/profile" 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
