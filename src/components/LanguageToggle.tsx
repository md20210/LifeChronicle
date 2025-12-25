/**
 * Language Toggle Component
 * Allows users to switch between DE/EN/ES
 */
import React from 'react';
import { useLanguage, type Language } from '../contexts/LanguageContext';

const LANGUAGES = [
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
];

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-300 shadow-sm">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-2 rounded-md font-medium transition-all text-sm ${
            language === lang.code
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={lang.name}
        >
          <span className="text-lg">{lang.flag}</span>
        </button>
      ))}
    </div>
  );
};
