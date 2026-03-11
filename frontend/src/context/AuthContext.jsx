import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUserFromStorage();
      if (storedUser && token) {
        setUser(storedUser);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      setUser(response.user);
      setToken(response.token);
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      toast.success('Logged in successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const createFamily = async (familyName) => {
    try {
      const response = await authService.createFamily(familyName);
      // Update user in storage and state
      const updatedUser = { ...user, familyId: response.family.id, role: 'admin' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Family created successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create family');
      throw error;
    }
  };

  const joinFamily = async (familyCode) => {
    try {
      const response = await authService.joinFamily(familyCode);
      // Update user in storage and state
      const updatedUser = { ...user, familyId: response.family.id };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Joined family successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join family');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    createFamily,
    joinFamily,
    refreshUser, // Add this to context
    isAuthenticated: !!user,
    needsOnboarding: user && !user.onboardingCompleted,
    needsFamily: user && !user.familyId
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};