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
    const response = await api.get('/lifechonicle/entries');
    return response.data.entries;
  },

  // Create new timeline entry
  createEntry: async (data: CreateEntryRequest): Promise<TimelineEntry> => {
    const response = await api.post('/lifechonicle/entries', data);
    return response.data.entry;
  },

  // Delete timeline entry
  deleteEntry: async (entryId: string): Promise<void> => {
    await api.delete(`/lifechonicle/entries/${entryId}`);
  },

  // Process entry with LLM (convert to book chapter)
  processEntry: async (entryId: string, provider: 'ollama' | 'grok' = 'ollama'): Promise<TimelineEntry> => {
    const response = await api.post(`/lifechonicle/entries/${entryId}/process`, { provider });
    return response.data.entry;
  },

  // Export timeline as PDF
  exportPDF: async (): Promise<Blob> => {
    const response = await api.get('/lifechonicle/export/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
