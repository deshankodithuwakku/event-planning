import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaUser, FaEdit, FaPhone, FaSignOutAlt, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if customer is logged in
    const customerData = localStorage.getItem('customerData');
    if (!customerData) {
      navigate('/customer/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const userData = JSON.parse(customerData);
        
        // Fetch the customer details using their ID
        const response = await axios.get(`http://localhost:5555/api/customers/${userData.C_ID}`);
        setProfile(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to fetch profile information', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, enqueueSnackbar]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-sky-600 hover:text-sky-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-sky-500 to-sky-600 text-white">
            <div className="flex items-center">
              <div className="bg-white p-4 rounded-full mr-4">
                <FaUser className="text-4xl text-sky-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile?.name}</h1>
                <p className="opacity-90">Customer ID: {profile?.C_ID}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{profile?.userName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-2" />
                    <p className="font-medium">{profile?.phoneNo}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
              <Link
                to="/customer/profile/edit"
                className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
              <button
                onClick={() => navigate('/customer/feedback-manage')}
                className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
              >
                Manage Feedback
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Account Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link 
                to="/customer/my-events"
                className="w-full flex items-center justify-between py-3 px-4 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-md transition"
              >
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3" />
                  <span className="font-medium">My Events</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
