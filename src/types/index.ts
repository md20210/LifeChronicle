export interface TimelineEntry {
  id: string;
  title: string; // Entry title/headline
  entry_date: string; // ISO date string (backend uses entry_date, not date)
  original_text: string;
  refined_text?: string; // Backend uses refined_text, not processed_text
  photo_urls?: string[];
  entry_metadata?: Record<string, any>;
  is_refined: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryRequest {
  title: string;
  date: string;
  original_text: string;
}

export interface ProcessEntryRequest {
  entry_id: string;
}
