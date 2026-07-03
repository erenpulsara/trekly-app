import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Tour, Booking, User, PointsLog, BlogPost } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://trekly-api-835377577547.europe-west1.run.app';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export interface LoginResponse {
  access_token: string;
  id: string;
  name: string;
  surname: string;
  email: string;
  total_points: number;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    name: string,
    surname: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify({ name, surname, email, password, phone }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
  },
};

export interface ToursFilters {
  difficulty?: string;
  category?: string;
  search?: string;
}

export interface CategoryItem {
  name: string;
  icon_key: string | null;
  icon_svg?: string | null;
  image_url?: string | null;
}

export const toursService = {
  async getAll(filters?: ToursFilters): Promise<Tour[]> {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return request<Tour[]>(`/tours${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<Tour> {
    return request<Tour>(`/tours/${id}`);
  },

  async getPopular(): Promise<Tour[]> {
    return request<Tour[]>('/tours?sort=popular');
  },

  async getCategories(): Promise<CategoryItem[]> {
    return request<CategoryItem[]>('/tours/categories');
  },

  async createWebBooking(
    tourId: string,
    data: {
      full_name: string;
      email: string;
      phone: string;
      participant_count: number;
      notes?: string;
    }
  ): Promise<{ id: string }> {
    return request<{ id: string }>(`/tours/${tourId}/web-booking`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const blogService = {
  async getAll(): Promise<BlogPost[]> {
    return request<BlogPost[]>('/blog');
  },

  async getBySlug(slug: string): Promise<BlogPost> {
    return request<BlogPost>(`/blog/${slug}`);
  },
};

export interface CreateBookingData {
  tour_id: string;
  tour_date_id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  participant_count: number;
  notes?: string;
}

export const bookingsService = {
  async create(data: CreateBookingData): Promise<Booking> {
    return request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMy(): Promise<Booking[]> {
    return request<Booking[]>('/bookings/my');
  },

  async getById(id: string): Promise<Booking> {
    return request<Booking>(`/bookings/${id}`);
  },

  async cancel(id: string): Promise<Booking> {
    return request<Booking>(`/bookings/${id}/cancel`, { method: 'POST' });
  },
};

export const usersService = {
  async getMe(): Promise<User> {
    return request<User>('/users/me');
  },

  async getPoints(): Promise<PointsLog[]> {
    return request<PointsLog[]>('/users/me/points');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    return request<{ message: string }>('/users/me', { method: 'DELETE' });
  },
};
