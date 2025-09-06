
import React, { createContext, useState, useEffect, useMemo, useCallback, useContext, ReactNode } from 'react';
import { UI_STRINGS_EN, UI_STRINGS_TR, UiStrings } from '../locales/ui';
import { OPERATORS_EN, OPERATOR_CATEGORIES_EN, OPERATORS_TR, OPERATOR_CATEGORIES_TR } from '../locales/data';
import type { SearchOperator } from '../types';

export type Language = 'en' | 'tr';

interface LocalizationContextType {
  language: Language;
  toggleLanguage: () => void;
  t: UiStrings;
  OPERATORS: SearchOperator[];
  OPERATOR_CATEGORIES: string[];
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedLang = window.localStorage.getItem('language');
            return (storedLang === 'en' || storedLang === 'tr') ? storedLang : 'en';
        }
        return 'en';
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('language', language);
        }
    }, [language]);

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => prev === 'en' ? 'tr' : 'en');
    }, []);

    const value = useMemo(() => {
        if (language === 'tr') {
            return {
                language,
                toggleLanguage,
                t: UI_STRINGS_TR,
                OPERATORS: OPERATORS_TR,
                OPERATOR_CATEGORIES: OPERATOR_CATEGORIES_TR
            };
        }
        return {
            language,
            toggleLanguage,
            t: UI_STRINGS_EN,
            OPERATORS: OPERATORS_EN,
            OPERATOR_CATEGORIES: OPERATOR_CATEGORIES_EN
        };
    }, [language, toggleLanguage]);

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
