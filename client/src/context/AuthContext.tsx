import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithPin: (pinCode: string, branchId?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nanifrys_pos_token') || localStorage.getItem('simba_pos_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data);
      if (data.branchId && !localStorage.getItem('nanifrys_pos_branch_id')) {
        localStorage.setItem('nanifrys_pos_branch_id', data.branchId);
      }
    } catch (err) {
      console.error('Session validation failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const loginWithCredentials = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('nanifrys_pos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.branchId) {
        localStorage.setItem('nanifrys_pos_branch_id', res.user.branchId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPin = async (pinCode: string, branchId?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ pinCode, branchId });
      localStorage.setItem('nanifrys_pos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.branchId) {
        localStorage.setItem('nanifrys_pos_branch_id', res.user.branchId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nanifrys_pos_token');
    localStorage.removeItem('simba_pos_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        loginWithCredentials,
        loginWithPin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
