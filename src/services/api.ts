import axios from 'axios';
import type { TimelineEntry, CreateEntryRequest } from '../types';

const API_BASE_URL = 'https://general-backend-production-a734.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const lifeChronicleApi = {
  // Get all timeline entries for current user
  getEntries: async (): Promise<TimelineEntry[]> => {
    const response = await api.get('/lifechronicle/entries');
    return response.data.entries;
  },

  // Create new timeline entry (with photos support)
  createEntry: async (data: CreateEntryRequest & { photos?: File[] }): Promise<TimelineEntry> => {
    // If photos are included, use FormData (multipart/form-data)
    if (data.photos && data.photos.length > 0) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('date', data.date);
      formData.append('text', data.original_text);

      // Append each photo
      data.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await api.post('/lifechronicle/entries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.entry;
    } else {
      // No photos, use JSON
      const response = await api.post('/lifechronicle/entries', {
        title: data.title,
        date: data.date,
        original_text: data.original_text,
      });
      return response.data.entry;
    }
  },

  // Delete timeline entry
  deleteEntry: async (entryId: string): Promise<void> => {
    await api.delete(`/lifechronicle/entries/${entryId}`);
  },

  // Process entry with LLM (convert to book chapter)
  processEntry: async (entryId: string, provider: 'ollama' | 'grok' = 'ollama'): Promise<TimelineEntry> => {
    const response = await api.post(`/lifechronicle/entries/${entryId}/process`, { provider });
    return response.data.entry;
  },

  // Export timeline as PDF
  exportPDF: async (): Promise<Blob> => {
    const response = await api.get('/lifechronicle/export/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
