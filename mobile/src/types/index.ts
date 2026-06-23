export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
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
  altitude_meters: number;
  difficulty: Difficulty;
  distance_km: number;
  max_participants: number;
  photo_urls: string[];
  status: 'draft' | 'published';
  points: number;
  dates: TourDate[];
  agency?: Agency;
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
