import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userid: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const { login } = useAuth();

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      await api.get('/health');
      setServerStatus('online');
    } catch (error) {
      console.log('Server status check failed:', error);
      setServerStatus('offline');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Connecting to server...');

    const { userid, password } = formData;

    if (!userid || !password) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      setLoadingMessage('');
      return;
    }

    const result = await login(userid, password, setLoadingMessage);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.message || 'Login failed');
    }
    
    setIsLoading(false);
    setLoadingMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to ATS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Applicant Tracking System
          </p>
          <div className="mt-2 text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              serverStatus === 'online' ? 'bg-green-100 text-green-800' :
              serverStatus === 'offline' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                serverStatus === 'online' ? 'bg-green-400' :
                serverStatus === 'offline' ? 'bg-red-400' :
                'bg-yellow-400 animate-pulse'
              }`}></div>
              {serverStatus === 'online' ? 'Server Online' :
               serverStatus === 'offline' ? 'Server Starting...' :
               'Checking Server...'}
            </div>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="userid" className="sr-only">
                User ID
              </label>
              <input
                id="userid"
                name="userid"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="User ID"
                value={formData.userid}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {loadingMessage || 'Signing in...'}
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {serverStatus === 'offline' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700 text-center mb-2">
                💡 <strong>Tip:</strong> The server is hosted on Render and may take a few seconds to start up. 
                If login fails, please wait a moment and try again.
              </p>
              <button
                type="button"
                onClick={checkServerStatus}
                className="w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded border border-blue-300 transition-colors"
              >
                🔄 Check Server Status
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 
