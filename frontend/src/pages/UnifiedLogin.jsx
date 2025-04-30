import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const UnifiedLogin = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination after login, or default destinations
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.userName || !formData.password) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      try {
        // Try the new unified login endpoint first
        result = await login(formData.userName, formData.password);
      } catch (err) {
        console.log('Unified login failed, trying fallback login', err);
        
        // Fall back to the old specific endpoints
        try {
          // Try customer login
          const customerResponse = await axios.post('http://localhost:5555/api/customers/login', formData);
          if (customerResponse.data) {
            localStorage.setItem('customerToken', customerResponse.data.token);
            localStorage.setItem('customerData', JSON.stringify(customerResponse.data.customer));
            localStorage.setItem('userRole', 'customer');
            result = { success: true, userType: 'customer' };
          }
        } catch (customerErr) {
          console.log('Customer login failed, trying admin login', customerErr);
          
          // Try admin login
          const adminResponse = await axios.post('http://localhost:5555/api/admins/login', formData);
          if (adminResponse.data) {
            localStorage.setItem('adminToken', adminResponse.data.token);
            localStorage.setItem('adminData', JSON.stringify(adminResponse.data.admin));
            localStorage.setItem('userRole', 'admin');
            result = { success: true, userType: 'admin' };
          }
        }
      }
      
      if (result && result.success) {
        enqueueSnackbar('Login successful!', { variant: 'success' });
        
        // Navigate based on user role
        if (result.userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          // Use the `from` location if available, otherwise go to home
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      enqueueSnackbar('Login failed. Please check your credentials.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/customer/register" className="font-medium text-blue-600 hover:text-blue-500">
                Don't have an account? Register
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedLogin;
