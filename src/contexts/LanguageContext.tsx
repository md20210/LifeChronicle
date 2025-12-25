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
  // Get initial language from localStorage or browser, default to 'de'
  const getInitialLanguage = (): Language => {
    const stored = localStorage.getItem('lifechonicle_language');
    if (stored && ['de', 'en', 'es'].includes(stored)) {
      return stored as Language;
    }

    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
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
        const response = await api.get(`/translations/${language}?t=${Date.now()}`);
        setTranslations(response.data.translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to minimal hardcoded translations
        setTranslations({
          lifechonicle_app_title: 'LifeChronicle',
          error: 'Error loading translations'
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
