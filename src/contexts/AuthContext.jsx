import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios interceptor for auth token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      console.log('🔍 Token Verification Debug:');
      console.log('  Token exists:', !!token);
      console.log('  API Base URL:', api.defaults.baseURL);
      
      if (token) {
        try {
          console.log('  Attempting token verification...');
          const response = await api.get('/auth/verify');
          console.log('  Verification response:', response.data);
          
          if (response.data.success) {
            console.log('  Token valid, setting user');
            setUser(response.data.user);
          } else {
            console.log('  Token invalid, logging out');
            logout();
          }
        } catch (error) {
          console.error('  Token verification error:', error);
          console.error('  Error response:', error.response);
          console.error('  Error status:', error.response?.status);
          logout();
        }
      } else {
        console.log('  No token found, skipping verification');
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (userid, password, onProgress) => {
    console.log('🔐 Login Debug:');
    console.log('  Attempting login for userid:', userid);
    console.log('  API Base URL:', api.defaults.baseURL);
    
    // First, try to wake up the backend with a health check
    try {
      console.log('  🔍 Checking backend health...');
      onProgress?.('Checking server status...');
      await api.get('/health');
      console.log('  ✅ Backend is responsive');
    } catch (healthError) {
      console.log('  ⚠️ Backend health check failed, proceeding with login anyway');
    }
    
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`  Making login request (attempt ${attempt}/${maxRetries})...`);
        onProgress?.(`Attempting login (${attempt}/${maxRetries})...`);
        const response = await api.post('/auth/login', {
          userid,
          password
        });

        console.log('  Login response received:', response.data);

        if (response.data.success) {
          const { token: newToken, user: userData } = response.data;
          console.log('  Login successful, setting token and user data');
          setToken(newToken);
          setUser(userData);
          localStorage.setItem('token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          return { success: true };
        } else {
          const message = response.data.message === 'Invalid credentials' 
            ? 'Check username and password' 
            : response.data.message;
          console.log('  Login failed with message:', message);
          return { success: false, message };
        }
      } catch (error) {
        lastError = error;
        console.error(`  Login attempt ${attempt} failed:`, error);
        
        // If it's a timeout and we have more attempts, wait and retry
        if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && attempt < maxRetries) {
          console.log(`  ⏳ Waiting 2 seconds before retry ${attempt + 1}...`);
          onProgress?.(`Connection timeout. Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // For other errors or final attempt, break and return error
        break;
      }
    }
    
    // All attempts failed
    console.error('  All login attempts failed');
    console.error('  Final error response:', lastError.response);
    console.error('  Final error status:', lastError.response?.status);
    console.error('  Final error data:', lastError.response?.data);
    
    const errorMessage = lastError.response?.data?.message || lastError.message || 'Login failed';
    const message = errorMessage === 'Invalid credentials' 
      ? 'Check username and password' 
      : errorMessage;
    return { success: false, message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
