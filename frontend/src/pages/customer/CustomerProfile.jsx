import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { 
  FaUser, 
  FaPhone, 
  FaIdCard, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaSignOutAlt, 
  FaEdit,
  FaArrowLeft
} from 'react-icons/fa';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const customerData = localStorage.getItem('customerData');
        if (!customerData) {
          enqueueSnackbar('Please log in to view your profile', { variant: 'error' });
          navigate('/customer/login');
          return;
        }
        
        const userData = JSON.parse(customerData);
        const userId = userData.userId || userData.C_ID; // Handle both new and old model
        
        let response;
        
        // Try new endpoint first
        try {
          response = await axios.get(`http://localhost:5555/api/auth/me`, {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('authToken')}` 
            }
          });
        } catch (err) {
          console.log('Falling back to direct profile fetch', err);
          
          // Try user model API
          try {
            response = await axios.get(`http://localhost:5555/api/users/profile/${userId}`);
          } catch (userErr) {
            // Fall back to old customer API
            response = await axios.get(`http://localhost:5555/api/customers/${userId}`);
          }
        }
        
        setProfile(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to load profile data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, enqueueSnackbar]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your profile...</p>
        </div>
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
                <h1 className="text-2xl font-bold">
                  {profile?.firstName && profile?.lastName 
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile?.name || 'Customer'}
                </h1>
                <p className="opacity-90">Customer ID: {profile?.userId || profile?.C_ID}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {profile?.firstName && profile?.lastName 
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile?.name || 'N/A'}
                  </p>
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
                    {profile?.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <div className="flex items-center">
                    <FaIdCard className="text-gray-400 mr-2" />
                    <p className="font-medium">{profile?.userId || profile?.C_ID}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                    <p className="font-medium text-green-700">Active</p>
                  </div>
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

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 mt-6">
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
              <Link 
                to="/customer/payments" 
                className="flex items-center p-3 text-base font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 group rounded-md"
              >
                <FaMoneyBillWave className="text-sky-600 mr-3" />
                <span className="flex-1">Payment History</span>
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
