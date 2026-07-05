export type Difficulty =
  | 'easy'
  | 'easy_medium'
  | 'medium'
  | 'medium_hard'
  | 'hard'
  | 'very_hard'
  | 'extreme';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Agency {
  id: string;
  name: string;
  logo_url?: string;
}

export interface TourDate {
  id: string;
  date: string;
  available_slots: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  altitude_meters: number | null;
  difficulty: Difficulty;
  distance_km: number | null;
  max_participants: number;
  photo_urls: string[];
  status: 'draft' | 'published';
  points: number;
  dates: TourDate[];
  agency?: Agency;
  created_at: string;
  category?: string | null;
  price?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR' | null;
  start_date?: string | null;
  end_date?: string | null;
  guide_name?: string | null;
  guide_instagram?: string | null;
  organizer?: string | null;
  agency_name?: string | null;
  tursab_no?: string | null;
  meeting_points?: string | null;
  target_location?: string | null;
  contact_phone?: string | null;
  accommodation?: string | null;
  accommodation_url?: string | null;
  transportation?: string | null;
  program?: string | null;
  important_notes?: string | null;
  booking_count?: number | null;
  tags?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  total_points: number;
}

export interface Booking {
  id: string;
  tour: Tour;
  tour_date: TourDate;
  name: string;
  surname: string;
  email: string;
  phone: string;
  participant_count: number;
  notes?: string;
  status: BookingStatus;
  created_at: string;
}

export interface PointsLog {
  id: string;
  tour: Tour;
  points_earned: number;
  awarded_at: string;
}

// Guest reservations made through the web-booking flow, matched by email
export interface UserWebBooking {
  id: string;
  participant_count: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  tour: Tour | null;
}

export interface Notification {
  id: string;
  type: 'booking_confirmed' | 'points_earned' | 'badge_earned' | 'reminder';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  value: number;
  trend: 'up' | 'down' | 'same';
}
