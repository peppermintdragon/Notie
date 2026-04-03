import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { UserProfile, AuthResponse } from '@shared/types/api';
import api from '../services/api';

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setAuthData: (data: AuthResponse) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.get<{ data: UserProfile }>('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, [logout]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', { email, password });
    setAuthData(res.data.data);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post<{ data: AuthResponse }>('/auth/register', { email, password, name });
    setAuthData(res.data.data);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}
