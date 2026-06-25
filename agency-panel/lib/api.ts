import { getToken, getAdminToken } from './auth';
import type {
  Booking,
  CreateTourDatePayload,
  CreateTourPayload,
  DashboardStats,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Tour,
  UpdateBookingStatusPayload,
  UpdateTourPayload,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data.message ?? data.detail ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Auth
export async function register(payload: RegisterRequest): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/agency/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/agency/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: { email: string; otp: string }): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/agency/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resendOtp(payload: { email: string }): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/agency/resend-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Tours
export async function getMyTours(): Promise<Tour[]> {
  return request<Tour[]>('/agency/tours');
}

export async function getTour(id: string): Promise<Tour> {
  return request<Tour>(`/agency/tours/${id}`);
}

export async function createTour(payload: CreateTourPayload): Promise<Tour> {
  return request<Tour>('/agency/tours', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTour(id: string, payload: UpdateTourPayload): Promise<Tour> {
  return request<Tour>(`/agency/tours/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTour(id: string): Promise<void> {
  return request<void>(`/agency/tours/${id}`, { method: 'DELETE' });
}

// Tour Dates
export async function addTourDate(tourId: string, payload: CreateTourDatePayload) {
  return request(`/agency/tours/${tourId}/dates`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteTourDate(tourId: string, dateId: string): Promise<void> {
  return request<void>(`/agency/tours/${tourId}/dates/${dateId}`, { method: 'DELETE' });
}

// Bookings
export async function getTourBookings(tourId: string): Promise<Booking[]> {
  return request<Booking[]>(`/agency/tours/${tourId}/bookings`);
}

export async function updateBookingStatus(
  bookingId: string,
  payload: UpdateBookingStatusPayload,
): Promise<Booking> {
  return request<Booking>(`/agency/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Dashboard — derived from tours + bookings
export async function getDashboardStats(): Promise<DashboardStats> {
  const tours = await getMyTours();
  const results = await Promise.allSettled(tours.map((t) => getTourBookings(t.id)));

  const allBookings: Booking[] = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled') allBookings.push(...r.value);
  });

  const recent = [...allBookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    total_tours: tours.length,
    total_bookings: allBookings.length,
    recent_bookings: recent,
  };
}

// Media
export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) throw new ApiError(res.status, `Upload failed: HTTP ${res.status}`);

  const data = (await res.json()) as { url: string };
  return data.url;
}

// ── Admin ─────────────────────────────────────────────────────────────────

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data.message ?? message;
    } catch { /* ignore */ }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function adminLogin(email: string, password: string): Promise<{ access_token: string }> {
  return request<{ access_token: string }>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface AdminAgency {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  logo_url: string | null;
  email_verified: boolean;
  created_at: string;
  tour_count: number;
}

export interface AdminTour {
  id: string;
  name: string;
  location_name: string;
  status: string;
  difficulty: string;
  price: string | null;
  created_at: string;
  agency: { id: string; name: string; email: string };
}

export async function adminGetAgencies(): Promise<AdminAgency[]> {
  return adminRequest<AdminAgency[]>('/admin/agencies');
}

export async function adminDeleteAgency(id: string): Promise<void> {
  return adminRequest<void>(`/admin/agencies/${id}`, { method: 'DELETE' });
}

export async function adminGetTours(): Promise<AdminTour[]> {
  return adminRequest<AdminTour[]>('/admin/tours');
}

export async function adminDeleteTour(id: string): Promise<void> {
  return adminRequest<void>(`/admin/tours/${id}`, { method: 'DELETE' });
}

// ── Admin Stats ───────────────────────────────────────────────────────────

export interface AdminStats {
  agencies: number;
  tours: number;
  bookings: number;
  blogPosts: number;
  pendingBookings: number;
}

export async function adminGetStats(): Promise<AdminStats> {
  return adminRequest<AdminStats>('/admin/stats');
}

// ── Admin Bookings ────────────────────────────────────────────────────────

export interface AdminBooking {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  participant_count: number;
  status: string;
  created_at: string;
  tour: { id: string; name: string; location_name: string } | null;
  user: { id: string; name: string; email: string } | null;
}

export async function adminGetBookings(): Promise<AdminBooking[]> {
  return adminRequest<AdminBooking[]>('/admin/bookings');
}

// ── Admin Blog ────────────────────────────────────────────────────────────

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function adminGetBlogPosts(): Promise<AdminBlogPost[]> {
  return adminRequest<AdminBlogPost[]>('/admin/blog');
}

export async function adminCreateBlogPost(dto: Partial<AdminBlogPost>): Promise<AdminBlogPost> {
  return adminRequest<AdminBlogPost>('/admin/blog', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function adminUpdateBlogPost(id: string, dto: Partial<AdminBlogPost>): Promise<AdminBlogPost> {
  return adminRequest<AdminBlogPost>(`/admin/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function adminDeleteBlogPost(id: string): Promise<void> {
  return adminRequest<void>(`/admin/blog/${id}`, { method: 'DELETE' });
}

// ── Admin Categories ──────────────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  icon_key: string | null;
  icon_svg: string | null;
  order: number;
  is_static: boolean;
  created_at: string;
}

export async function adminGetCategories(): Promise<AdminCategory[]> {
  return adminRequest<AdminCategory[]>('/admin/categories');
}

export async function adminCreateCategory(dto: { name: string; icon_key?: string; icon_svg?: string }): Promise<AdminCategory> {
  return adminRequest<AdminCategory>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function adminUpdateCategory(id: string, dto: { icon_key?: string; name?: string }): Promise<AdminCategory> {
  return adminRequest<AdminCategory>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function adminDeleteCategory(id: string): Promise<void> {
  return adminRequest<void>(`/admin/categories/${id}`, { method: 'DELETE' });
}

export async function adminUpdateCategoryIcon(id: string, icon_svg: string): Promise<AdminCategory> {
  return adminRequest<AdminCategory>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ icon_svg }),
  });
}

// ── Admin Users ───────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  total_points: number;
  is_banned: boolean;
  created_at: string;
}

export async function adminGetUsers(): Promise<AdminUser[]> {
  return adminRequest<AdminUser[]>('/admin/users');
}

export async function adminBanUser(id: string): Promise<{ message: string }> {
  return adminRequest<{ message: string }>(`/admin/users/${id}/ban`, { method: 'PATCH' });
}

export async function adminActivateUser(id: string): Promise<{ message: string }> {
  return adminRequest<{ message: string }>(`/admin/users/${id}/activate`, { method: 'PATCH' });
}

// ── Admin Reports ─────────────────────────────────────────────────────────

export interface AdminReports {
  totalBookings: number;
  totalUsers: number;
  totalAgencies: number;
  totalTours: number;
  topTours: { id: string; name: string; bookings: number }[];
  topAgencies: { id: string; name: string; tours: number }[];
}

export async function adminGetReports(): Promise<AdminReports> {
  return adminRequest<AdminReports>('/admin/reports');
}
