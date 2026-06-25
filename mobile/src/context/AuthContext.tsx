import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService, LoginResponse } from '../services/api';
import { User } from '../types';

interface AuthUser extends User {
  access_token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    surname: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  continueAsGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapResponseToUser(resp: LoginResponse): AuthUser {
  return {
    id: resp.id,
    name: resp.name,
    surname: resp.surname,
    email: resp.email,
    total_points: resp.total_points,
    access_token: resp.access_token,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const persistSession = useCallback(async (resp: LoginResponse) => {
    const authUser = mapResponseToUser(resp);
    await SecureStore.setItemAsync('auth_token', resp.access_token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));
    setToken(resp.access_token);
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const resp = await authService.login(email, password);
      await persistSession(resp);
    },
    [persistSession]
  );

  const register = useCallback(
    async (
      name: string,
      surname: string,
      email: string,
      password: string,
      phone?: string
    ) => {
      const resp = await authService.register(name, surname, email, password, phone);
      await persistSession(resp);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => setIsGuest(true), []);
  const exitGuest = useCallback(() => setIsGuest(false), []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isGuest, login, register, logout, updateUser, continueAsGuest, exitGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
