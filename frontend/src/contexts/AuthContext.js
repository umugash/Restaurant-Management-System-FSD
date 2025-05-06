import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const fetchUser = async () => {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        try {
          const { token } = JSON.parse(userInfo);
          
          // Set the authorization header for all future axios requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user profile
          const { data } = await axios.get('/api/auth/profile');
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('userInfo');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      // Save user info to localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      }));
      
      // Set the authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      
      toast.success(`Welcome back, ${data.name}!`);
      return true;
    } catch (error) {
      const message = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'Login failed, please try again';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Logged out successfully');
  };

  const registerUser = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      toast.success(`User ${data.name} registered successfully!`);
      return true;
    } catch (error) {
      const message = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'Registration failed, please try again';
      toast.error(message);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registerUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};