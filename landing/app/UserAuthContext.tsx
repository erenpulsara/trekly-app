'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  WebUser,
  getStoredUser,
  clearUserSession,
  userLogin as apiLogin,
  userRegister as apiRegister,
} from '@/lib/user-api';

interface UserAuthContextValue {
  user: WebUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, surname: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WebUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
  }, []);

  const register = useCallback(
    async (name: string, surname: string, email: string, password: string, phone?: string) => {
      const u = await apiRegister(name, surname, email, password, phone);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(() => {
    clearUserSession();
    setUser(null);
  }, []);

  // Re-read the cached user (e.g. after a profile update refreshed localStorage)
  const refreshUser = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth(): UserAuthContextValue {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
}
