import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosConfig';
import { useSnackbar } from 'notistack';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUserFromStorage = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (token && role) {
        try {
          let userData = null;
          if (role === 'customer') {
            userData = JSON.parse(localStorage.getItem('customerData'));
          } else if (role === 'admin') {
            userData = JSON.parse(localStorage.getItem('adminData'));
          }
          
          if (userData) {
            setCurrentUser(userData);
            setUserRole(role);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    loadUserFromStorage();
  }, []);

  const login = async (userName, password) => {
    try {
      // Try unified login first
      try {
        const response = await api.post('/auth/login', { userName, password });
        const { token, userType, user } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', userType);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Keep backward compatibility by storing data in old locations too
        if (userType === 'customer') {
          localStorage.setItem('customerData', JSON.stringify({
            ...user,
            C_ID: user.userId // Map userId to C_ID for backward compatibility
          }));
        } else {
          localStorage.setItem('adminData', JSON.stringify({
            ...user,
            A_ID: user.userId // Map userId to A_ID for backward compatibility
          }));
        }
        
        setCurrentUser(user);
        setUserRole(userType);
        
        return { success: true, userType };
      } catch (unifiedError) {
        console.log('Unified login failed:', unifiedError);
        throw unifiedError; // Let the component handle fallback
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      enqueueSnackbar(message, { variant: 'error' });
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerData');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userRole');
    
    setCurrentUser(null);
    setUserRole(null);
    
    enqueueSnackbar('Successfully logged out', { variant: 'success' });
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      if (userData.role === 'customer') {
        localStorage.setItem('customerData', JSON.stringify(userData));
        setUserRole('customer');
      } else {
        localStorage.setItem('adminData', JSON.stringify(userData));
        setUserRole('admin');
      }
      
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  // Context value
  const value = {
    currentUser,
    userRole,
    loading,
    isAdmin: userRole === 'admin',
    isCustomer: userRole === 'customer',
    isAuthenticated: !!currentUser,
    login,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier context usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
