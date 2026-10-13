import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('parkingToken') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('parkingUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const saveSession = (authData) => {
    if (authData?.token) {
      localStorage.setItem('parkingToken', authData.token);
      setToken(authData.token);
    }

    if (authData?.user) {
      localStorage.setItem('parkingUser', JSON.stringify(authData.user));
      setUser(authData.user);
    }
  };

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload);
    saveSession(response.data);
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    saveSession(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('parkingToken');
    localStorage.removeItem('parkingUser');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
