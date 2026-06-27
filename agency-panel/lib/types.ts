export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  phone?: string;
  description?: string;
  created_at: string;
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  created_at: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type TourStatus = 'draft' | 'published' | 'rejected';

export interface TourDate {
  id: string;
  tour_id: string;
  date: string;
  available_slots: number;
  created_at: string;
}

export interface Tour {
  id: string;
  agency_id: string;
  name: string;
  description?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  altitude_meters?: number | null;
  difficulty: Difficulty;
  distance_km?: number | null;
  max_participants: number;
  photo_urls: string[];
  status: TourStatus;
  admin_note?: string | null;
  points: number;
  dates: TourDate[];
  created_at: string;
  updated_at: string;
  // Extended fields
  category?: string | null;
  price?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  guide_name?: string | null;
  guide_instagram?: string | null;
  tursab_no?: string | null;
  meeting_points?: string | null;
  target_location?: string | null;
  contact_phone?: string | null;
  accommodation?: string | null;
  transportation?: string | null;
  program?: string | null;
  important_notes?: string | null;
  tags?: string[];
  organizer?: string | null;
}

export interface CreateTourPayload {
  name: string;
  description?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  altitude_meters?: number;
  difficulty: Difficulty;
  distance_km?: number;
  max_participants: number;
  photo_urls: string[];
  status: TourStatus;
  // Extended fields
  category?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  guide_name?: string;
  tursab_no?: string;
  meeting_points?: string;
  target_location?: string;
  contact_phone?: string;
  accommodation?: string;
  transportation?: string;
  program?: string;
  important_notes?: string;
  tags?: string[];
  organizer?: string;
}

export type UpdateTourPayload = Partial<CreateTourPayload>;

export interface CreateTourDatePayload {
  date: string;
  available_slots: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  tour_id: string;
  tour_date_id: string;
  user_id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  participant_count: number;
  notes?: string;
  status: BookingStatus;
  created_at: string;
  tour?: Tour;
  tour_date?: TourDate;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}

export interface MediaUploadResponse {
  url: string;
}

export interface DashboardStats {
  total_tours: number;
  total_bookings: number;
  recent_bookings: Booking[];
}

export type WebBookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface WebBooking {
  id: string;
  tour_id: string;
  full_name: string;
  email: string;
  phone: string;
  participant_count: number;
  notes?: string | null;
  status: WebBookingStatus;
  created_at: string;
  tour?: { id: string; name: string };
}
