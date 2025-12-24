export interface TimelineEntry {
  id: string;
  date: string; // ISO date string or year
  original_text: string;
  processed_text?: string;
  status: 'pending' | 'processed';
  created_at: string;
}

export interface CreateEntryRequest {
  date: string;
  original_text: string;
}

export interface ProcessEntryRequest {
  entry_id: string;
}
