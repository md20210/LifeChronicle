/**
 * Language Context for Multi-language Support
 * Provides language state and translation functions to all components
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export type Language = 'de' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  translations: Record<string, string>;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language Provider Component
 * Wraps the app and provides language context to all children
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get initial language from localStorage, default to German (like other projects)
  const getInitialLanguage = (): Language => {
    const stored = localStorage.getItem('lifechonicle_language');
    if (stored && ['de', 'en', 'es'].includes(stored)) {
      return stored as Language;
    }

    // Default to German (DSGVO-compliant, matches other projects)
    return 'de';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Fetch translations when language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Only show loading on initial load, not on language switches
        const isInitialLoad = Object.keys(translations).length === 0;
        if (isInitialLoad) {
          setLoading(true);
        }

        // Add cache-busting timestamp to always get fresh translations
        // Use shorter timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await api.get(`/translations/${language}?t=${Date.now()}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        setTranslations(response.data.translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to minimal German translations
        setTranslations({
          lifechonicle_app_title: 'LifeChronicle',
          lifechonicle_app_subtitle: 'Meine Lebensgeschichte - lokal & DSGVO-konform',
          lifechonicle_loading: 'Lädt...',
          lifechonicle_llm_toggle_local: '🏠 Lokal (DSGVO)',
          lifechonicle_llm_toggle_grok: '⚡ GROK (nicht DSGVO)',
          lifechonicle_btn_export_pdf: 'PDF Export',
          lifechonicle_btn_new_entry: 'Neuer Eintrag',
          lifechonicle_timeline_title: 'Zeitleiste ({count})',
          lifechonicle_empty_state: 'Noch keine Einträge vorhanden',
          lifechonicle_empty_hint: 'Klicke auf "Neuer Eintrag", um deine erste Lebensgeschichte zu erzählen!',
          error: 'Backend nicht erreichbar - Offline-Modus'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [language]);

  // Set language and persist to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lifechonicle_language', lang);
  };

  /**
   * Translation function
   * @param key - Translation key (e.g., 'app_title')
   * @param params - Optional parameters for string interpolation (e.g., {count: 5})
   * @returns Translated string
   */
  const t = (key: string, params?: Record<string, any>): string => {
    let translation = translations[key] || key;

    // Replace parameters like {count}, {error}, etc.
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, String(params[param]));
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to use language context
 * @returns Language context with t() function, language state, and setLanguage
 * @example
 * const { t, language, setLanguage } = useLanguage();
 * return <h1>{t('lifechonicle_app_title')}</h1>
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
