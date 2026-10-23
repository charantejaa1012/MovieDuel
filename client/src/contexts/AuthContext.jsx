import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authApi.getMe();
        if (isMounted) {
          setUser(res.user || res.data || null);
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login(email, password);
      const authToken = res.token || res.data?.token;
      const authUser = res.user || res.data?.user;

      if (authToken) {
        localStorage.setItem('token', authToken);
        setToken(authToken);
      }
      if (authUser) {
        localStorage.setItem('user', JSON.stringify(authUser));
        setUser(authUser);
      }
      return { success: true, user: authUser };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const res = await authApi.register(name, email, password);
      const authToken = res.token || res.data?.token;
      const authUser = res.user || res.data?.user;

      if (authToken) {
        localStorage.setItem('token', authToken);
        setToken(authToken);
      }
      if (authUser) {
        localStorage.setItem('user', JSON.stringify(authUser));
        setUser(authUser);
      }
      return { success: true, user: authUser };
    } catch (err) {
      const detailed = err.response?.data?.errors?.map((e) => e.message).join('. ');
      const message = detailed || err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('movie_duel_watchlist');
      localStorage.removeItem('movie_duel_guest_watchlist');
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
