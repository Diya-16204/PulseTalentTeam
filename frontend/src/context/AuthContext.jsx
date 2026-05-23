/**
 * Auth Context
 * Manages user authentication state and provides auth functions
 */

import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Register user
  const register = async (firstName, lastName, email, password, confirmPassword) => {
    try {
      setError(null);
      const response = await authAPI.register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      });

      const { token, data } = response.data;
      setToken(token);
      setUser(data);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });

      const { token, data } = response.data;
      setToken(token);
      setUser(data);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(userData);
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      throw err;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!token && !!user;

  // Check if user has specific role
  const hasRole = (role) => user?.role === role || user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
