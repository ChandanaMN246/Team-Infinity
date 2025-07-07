import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8001';

  // Global fetch wrapper for protected endpoints
  const authFetch = async (url, options = {}) => {
    const jwt = localStorage.getItem('token');
    if (!jwt) {
      logout();
      return Promise.reject('No token');
    }
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': options.body ? 'application/json' : undefined,
    };
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        logout();
        navigate('/login');
        return Promise.reject('Unauthorized');
      }
      // For other errors (like 500), just return the response
      return response;
    } catch (err) {
      // Only log out on network errors if you want, or just throw
      throw err;
    }
  };

  // Axios instance for protected endpoints (bonus)
  // import axios from 'axios';
  // const axiosInstance = axios.create({
  //   baseURL: API_BASE_URL,
  // });
  // axiosInstance.interceptors.request.use(
  //   (config) => {
  //     const jwt = localStorage.getItem('token');
  //     if (jwt) {
  //       config.headers['Authorization'] = `Bearer ${jwt}`;
  //     }
  //     return config;
  //   },
  //   (error) => Promise.reject(error)
  // );

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        await fetchUser();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (email, username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    authFetch, // Use this for all protected API calls
    API_BASE_URL,
    // axiosInstance, // Uncomment if you want to use axios
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 