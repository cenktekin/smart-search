
import React from 'react';
import { SunIcon, MoonIcon, SearchIcon, LanguageIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const { language, toggleLanguage, t } = useLocalization();

  return (
    <header className="bg-kde-panel-light dark:bg-kde-panel-dark shadow-md border-b border-kde-border-light dark:border-kde-border-dark">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <SearchIcon className="h-8 w-8 text-kde-accent" />
          <h1 className="text-2xl font-bold text-kde-text-light dark:text-kde-text-dark">
            {t.smartSearchBuilder}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full text-kde-text-light dark:text-kde-text-dark bg-kde-bg-light dark:bg-kde-bg-dark hover:bg-kde-border-light dark:hover:bg-kde-border-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark transition-all flex items-center gap-2"
            aria-label={t.toggleLanguage}
          >
            <LanguageIcon className="h-6 w-6" />
            <span className="font-semibold uppercase">{language === 'en' ? 'tr' : 'en'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-kde-text-light dark:text-kde-text-dark bg-kde-bg-light dark:bg-kde-bg-dark hover:bg-kde-border-light dark:hover:bg-kde-border-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark transition-all"
            aria-label={t.toggleTheme}
          >
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};
