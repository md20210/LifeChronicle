import axios from 'axios';
import type { TimelineEntry, CreateEntryRequest } from '../types';

const API_BASE_URL = 'https://general-backend-production-a734.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch demo token for testing (auto-login)
let authInitialized: Promise<void>;

const initDemoAuth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/demo/token`);
    const token = response.data.access_token;

    // Set token as default Authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Demo authentication initialized');
  } catch (error) {
    console.error('❌ Failed to initialize demo auth:', error);
  }
};

// Initialize demo auth when module loads
authInitialized = initDemoAuth();

export const lifeChronicleApi = {
  // Get all timeline entries for current user
  getEntries: async (): Promise<TimelineEntry[]> => {
    await authInitialized; // Wait for auth to complete
    const response = await api.get('/lifechronicle/entries');
    return response.data.entries;
  },

  // Create new timeline entry (with photos support)
  createEntry: async (data: CreateEntryRequest & { photos?: File[] }): Promise<TimelineEntry> => {
    await authInitialized; // Wait for auth to complete

    // Backend expects FormData (even without photos)
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('date', data.date);
    formData.append('text', data.original_text);

    // Append photos if present
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    // Don't manually set Content-Type - let axios add boundary automatically
    const response = await api.post('/lifechronicle/entries', formData);
    return response.data.entry;
  },

  // Delete timeline entry
  deleteEntry: async (entryId: string): Promise<void> => {
    await authInitialized; // Wait for auth to complete
    await api.delete(`/lifechronicle/entries/${entryId}`);
  },

  // Process entry with LLM (convert to book chapter)
  processEntry: async (entryId: string, provider: 'ollama' | 'grok' = 'ollama'): Promise<TimelineEntry> => {
    await authInitialized; // Wait for auth to complete
    const response = await api.post(`/lifechronicle/entries/${entryId}/process`, { provider });
    return response.data.entry;
  },

  // Export timeline as PDF
  exportPDF: async (): Promise<Blob> => {
    await authInitialized; // Wait for auth to complete
    const response = await api.get('/lifechronicle/export/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
