import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check session via cookie — Spring Boot reads the HttpOnly cookie automatically
    api('/auth/me')
      .then((response) => {
        const userData = response?.data ?? response;
        setUser(userData);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // 401 = no valid session / cookie expired
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('[auth] logout failed:', e.message);
    } finally {
      // Clear client state regardless — if backend fails,
      // user is at least logged out on the frontend
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const setAuthUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, logout, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
