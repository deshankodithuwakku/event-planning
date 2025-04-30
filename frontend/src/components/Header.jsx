import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaUser } from 'react-icons/fa';
import logo1 from '../assets/logo1.jpg';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowAuthDropdown(false);
    window.location.href = '/'; // Refresh the page to update state
  };

  return (
    <header className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and site name section */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo1} alt="Bloomz Logo" className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md" />
            <span className="text-white text-xl font-bold">Bloomz (pvt) Ltd.</span>
          </Link>

          {/* Main navigation links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-blue-100 transition">Home</Link>
            <Link to="/events" className="text-white hover:text-blue-100 transition">Events</Link>
            <Link to="/about" className="text-white hover:text-blue-100 transition">About</Link>
            <Link to="/contact" className="text-white hover:text-blue-100 transition">Contact</Link>
            <Link to="/feedbackviews" className="text-white hover:text-blue-100 transition">Feedback</Link>
            {isAuthenticated && (
              <Link to={isAdmin ? "/admin/dashboard" : "/customer/profile"} className="text-white hover:text-blue-100 transition">
                {isAdmin ? "Dashboard" : "Profile"}
              </Link>
            )}
          </nav>

          {/* Authentication dropdown section */}
          <div className="relative">
            {/* Dropdown toggle button */}
            <button 
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              className="flex items-center space-x-1 text-white px-4 py-2 rounded-full bg-blue-700 hover:bg-blue-800 transition"
            >
              <FaUserCircle />
              <span>{isAuthenticated ? currentUser?.userName || 'Account' : 'Account'}</span>
              <FaCaretDown className={`transition-transform duration-300 ${showAuthDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu content */}
            {showAuthDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-20">
                {isAuthenticated ? (
                  // Logged in user menu
                  <div className="px-4 py-2">
                    {/* User profile summary */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-sky-100 p-2 rounded-full">
                        <FaUser className="text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium">{currentUser?.userName}</p>
                        <p className="text-xs text-gray-500">{isAdmin ? currentUser?.A_ID : currentUser?.C_ID}</p>
                      </div>
                    </div>
                    {/* Profile actions */}
                    <div className="space-y-2">
                      <Link 
                        to={isAdmin ? "/admin/dashboard" : "/customer/profile"} 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        {isAdmin ? "Dashboard" : "My Profile"}
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
                  // Login/Register options for non-authenticated users
                  <>
                    {/* Customer authentication options */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="flex mt-2 space-x-2">
                        <Link 
                          to="/login" 
                          className="flex-1 text-center px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded"
                          onClick={() => setShowAuthDropdown(false)}
                        >
                          Login
                        </Link>
                        <Link 
                          to="/customer/register" 
                          className="flex-1 text-center px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
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
