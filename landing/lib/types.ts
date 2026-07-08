export type TourDifficulty =
  | 'easy'
  | 'easy_medium'
  | 'medium'
  | 'medium_hard'
  | 'hard'
  | 'very_hard'
  | 'extreme';

export interface TourDate {
  id: string;
  date: string;
  available_slots: number;
}

export interface Tour {
  id: string;
  slug?: string | null;
  agency_id: string;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  altitude_meters?: number | null;
  difficulty: TourDifficulty;
  distance_km?: number | null;
  max_participants: number;
  photo_urls: string[];
  status: 'draft' | 'published';
  points: number;
  created_at: string;
  updated_at: string;
  dates: TourDate[];
  category?: string | null;
  price?: number | null;
  price_currency?: 'TRY' | 'USD' | 'EUR' | null;
  start_date?: string | null;
  end_date?: string | null;
  guide_name?: string | null;
  guide_instagram?: string | null;
  agency_name?: string | null;
  target_location?: string | null;
  meeting_points?: string | null;
  accommodation?: string | null;
  accommodation_url?: string | null;
  transportation?: string | null;
  program?: string | null;
  important_notes?: string | null;
  tursab_no?: string | null;
  contact_phone?: string | null;
  tags?: string[];
  booking_count?: number;
  organizer?: string | null;
}
