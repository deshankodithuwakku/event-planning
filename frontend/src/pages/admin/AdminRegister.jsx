import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaUserShield, FaLock, FaIdCard, FaPhone } from 'react-icons/fa';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    A_ID: '',
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
    const fetchAdminId = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/admins/generate-id');
        setFormData(prev => ({ ...prev, A_ID: response.data.id }));
      } catch (error) {
        enqueueSnackbar('Failed to generate Admin ID. Please try again.', { variant: 'error' });
      } finally {
        setFetchingId(false);
      }
    };

    fetchAdminId();
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
    if (!formData.A_ID || !formData.userName || 
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
        A_ID: formData.A_ID,
        userName: formData.userName,
        password: formData.password,
        phoneNo: formData.phoneNo
      };
      
      const response = await axios.post('http://localhost:5555/api/admins', apiData);
      
      enqueueSnackbar('Admin registration successful!', { variant: 'success' });
      setTimeout(() => {
        navigate('/admin/login');
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
    <div className="flex min-h-screen bg-purple-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-purple-800">Create Admin Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register to manage the event planning platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="A_ID" className="block text-sm font-medium text-gray-700 mb-1">Admin ID (Auto-generated)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="A_ID"
                  name="A_ID"
                  type="text"
                  value={fetchingId ? "Generating ID..." : formData.A_ID}
                  readOnly
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  placeholder="Admin ID"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="userName" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserShield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Phone Number"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/admin/login" className="font-medium text-purple-600 hover:text-purple-500">
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
