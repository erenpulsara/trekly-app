import { getToken } from './auth';
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
