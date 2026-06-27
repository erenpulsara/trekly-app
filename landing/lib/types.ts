export type TourDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface TourDate {
  id: string;
  date: string;
  available_slots: number;
}

export interface Tour {
  id: string;
  agency_id: string;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  altitude_meters: number;
  difficulty: TourDifficulty;
  distance_km: number;
  max_participants: number;
  photo_urls: string[];
  status: 'draft' | 'published';
  points: number;
  created_at: string;
  updated_at: string;
  dates: TourDate[];
  category?: string | null;
  price?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  guide_name?: string | null;
  target_location?: string | null;
  meeting_points?: string | null;
  accommodation?: string | null;
  transportation?: string | null;
  program?: string | null;
  important_notes?: string | null;
  tursab_no?: string | null;
  contact_phone?: string | null;
  tags?: string[];
}
