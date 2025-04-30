import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { FaUserAlt, FaLock, FaIdCard, FaPhone } from 'react-icons/fa';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    C_ID: '',
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    confirmPassword: '',
    phoneNo: ''
  });
  
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phoneNo: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        // Try the new endpoint first
        let response;
        try {
          response = await axios.get('http://localhost:5555/api/users/generate-customer-id');
        } catch (err) {
          // Fall back to the old endpoint if the new one fails
          console.log('Falling back to old endpoint', err);
          response = await axios.get('http://localhost:5555/api/customers/generate-id');
        }
        setFormData(prev => ({ ...prev, C_ID: response.data.id }));
      } catch (error) {
        enqueueSnackbar('Failed to generate Customer ID. Please try again.', { variant: 'error' });
      } finally {
        setFetchingId(false);
      }
    };

    fetchCustomerId();
  }, [enqueueSnackbar]);

  const validateFirstName = (name) => {
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(name)) {
      return 'First name should contain letters only';
    }
    return '';
  };

  const validateLastName = (name) => {
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(name)) {
      return 'Last name should contain letters only';
    }
    return '';
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return '';
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    
    if (!hasLowerCase && !hasUpperCase) {
      return 'Password must include at least one lowercase and one uppercase letter';
    } else if (!hasLowerCase) {
      return 'Password must include at least one lowercase letter';
    } else if (!hasUpperCase) {
      return 'Password must include at least one uppercase letter';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'firstName' && value) {
      setErrors(prev => ({...prev, firstName: validateFirstName(value)}));
    } else if (name === 'lastName' && value) {
      setErrors(prev => ({...prev, lastName: validateLastName(value)}));
    } else if (name === 'phoneNo' && value) {
      setErrors(prev => ({...prev, phoneNo: validatePhoneNumber(value)}));
    } else if (name === 'password' && value) {
      setErrors(prev => ({...prev, password: validatePassword(value)}));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.C_ID || !formData.firstName || !formData.lastName || !formData.userName || 
        !formData.password || !formData.confirmPassword || !formData.phoneNo) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    
    const firstNameError = validateFirstName(formData.firstName);
    const lastNameError = validateLastName(formData.lastName);
    const phoneError = validatePhoneNumber(formData.phoneNo);
    const passwordError = validatePassword(formData.password);
    
    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      phoneNo: phoneError,
      password: passwordError
    });
    
    if (firstNameError || lastNameError || phoneError || passwordError) {
      enqueueSnackbar('Please fix the highlighted errors', { variant: 'error' });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const apiData = {
        userId: formData.C_ID,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName,
        password: formData.password,
        phoneNo: formData.phoneNo
      };
      
      let response;
      try {
        // Try the new endpoint first
        response = await axios.post('http://localhost:5555/api/users/customer', apiData);
      } catch (err) {
        // Fall back to the old endpoint if the new one fails
        console.log('Falling back to old endpoint', err);
        
        // Map the data back to the format expected by the old endpoint
        const oldApiData = {
          C_ID: formData.C_ID,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userName: formData.userName,
          password: formData.password,
          phoneNo: formData.phoneNo
        };
        
        response = await axios.post('http://localhost:5555/api/customers', oldApiData);
      }
      
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
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                  placeholder="First Name"
                />
              </div>
              <p className="text-xs mt-1 text-red-500">{errors.firstName}</p>
              <p className="text-xs mt-1 text-gray-500">Example: <span className="text-sky-600">Johan</span></p>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                  placeholder="Last Name"
                />
              </div>
              <p className="text-xs mt-1 text-red-500">{errors.lastName}</p>
              <p className="text-xs mt-1 text-gray-500">Example: <span className="text-sky-600">Smith</span></p>
            </div>
            
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                  placeholder="Password"
                />
              </div>
              {errors.password && <p className="text-xs mt-1 text-red-500">{errors.password}</p>}
              <p className="text-xs mt-1 text-gray-500">Password must contain at least one uppercase and one lowercase letter</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
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
              <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.phoneNo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                  placeholder="Phone Number"
                />
              </div>
              <p className="text-xs mt-1 text-red-500">{errors.phoneNo}</p>
              <p className="text-xs mt-1 text-gray-500">Example: <span className="text-sky-600">0712345678</span> (10 digits)</p>
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
