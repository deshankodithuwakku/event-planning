import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaUserAlt, FaLock, FaIdCard, FaPhone } from 'react-icons/fa';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    C_ID: '',
    name: '',
    userName: '',
    password: '',
    confirmPassword: '',
    phoneNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/customers/generate-id');
        setFormData(prev => ({ ...prev, C_ID: response.data.id }));
      } catch (error) {
        enqueueSnackbar('Failed to generate Customer ID. Please try again.', { variant: 'error' });
      } finally {
        setFetchingId(false);
      }
    };

    fetchCustomerId();
  }, [enqueueSnackbar]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.C_ID || !formData.name || !formData.userName || 
        !formData.password || !formData.confirmPassword || !formData.phoneNo) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API call (remove confirmPassword)
      const apiData = {
        C_ID: formData.C_ID,
        name: formData.name,
        userName: formData.userName,
        password: formData.password,
        phoneNo: formData.phoneNo
      };
      
      const response = await axios.post('http://localhost:5555/api/customers', apiData);
      
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      setTimeout(() => {
        navigate('/customer/login');
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Registration failed. Please try again.', { variant: 'error' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-sky-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-sky-800">Create Customer Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our platform to start planning your events
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="C_ID" className="block text-sm font-medium text-gray-700 mb-1">Customer ID (Auto-generated)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="C_ID"
                  name="C_ID"
                  type="text"
                  value={fetchingId ? "Generating ID..." : formData.C_ID}
                  readOnly
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  placeholder="Customer ID"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Full Name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="userName" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Password"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNo" className="sr-only">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNo"
                  name="phoneNo"
                  type="text"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Phone Number"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/customer/login" className="font-medium text-sky-600 hover:text-sky-500">
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegister;
