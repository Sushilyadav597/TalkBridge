import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  // Sync / verify user profile on initial load if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const freshUser = await userService.getMe();
          setUser(freshUser);
        } catch (err) {
          // Token expired or invalid
          console.warn('Session expired or invalid token:', err);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();

    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('talkbridge_user', JSON.stringify(updatedUser));
  };

  const refreshUser = useCallback(async () => {
    if (token) {
      try {
        const freshUser = await userService.getMe();
        setUser(freshUser);
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  }, [token]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
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
