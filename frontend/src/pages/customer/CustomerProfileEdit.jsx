import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaUser, FaPhone, FaLock, FaArrowLeft, FaSave } from 'react-icons/fa';

const CustomerProfileEdit = () => {
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
  });
  
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
        const profileData = response.data;
        
        // Store the original data
        setOriginalData(profileData);
        
        // Set form data (omit password fields)
        setFormData({
          name: profileData.name || '',
          userName: profileData.userName || '',
          phoneNo: profileData.phoneNo || '',
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        enqueueSnackbar('Failed to fetch profile information', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any fields have changed
    const hasChanges = 
      formData.name !== originalData.name ||
      formData.userName !== originalData.userName ||
      formData.phoneNo !== originalData.phoneNo ||
      formData.password;
      
    if (!hasChanges) {
      enqueueSnackbar('No changes detected', { variant: 'info' });
      return;
    }
    
    // Validate password match if password field is filled
    if (formData.password && formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    
    setUpdating(true);
    
    try {
      // Prepare data for API call
      const updateData = {
        name: formData.name,
        userName: formData.userName,
        phoneNo: formData.phoneNo
      };
      
      // Only include password if it was provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Update the profile
      const response = await axios.put(
        `http://localhost:5555/api/customers/${originalData.C_ID}`,
        updateData
      );
      
      // Update the stored customer data
      const customerData = JSON.parse(localStorage.getItem('customerData'));
      const updatedCustomerData = {
        ...customerData,
        ...updateData
      };
      localStorage.setItem('customerData', JSON.stringify(updatedCustomerData));
      
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      navigate('/customer/profile');
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update profile',
        { variant: 'error' }
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-gray-600">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/customer/profile')}
          className="flex items-center text-sky-600 hover:text-sky-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Profile
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-sky-800">Edit Profile</h2>
            <p className="text-gray-600 mt-1">Update your personal information</p>
          </div>
          
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  id="phoneNo"
                  name="phoneNo"
                  type="text"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
              <p className="text-sm text-gray-500 mb-4">Leave blank if you don't want to change your password</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={updating}
                className={`flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
                  updating ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
              >
                {updating ? 'Updating...' : (
                  <>
                    <FaSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileEdit;
