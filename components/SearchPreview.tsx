
import React from 'react';
import { SearchIcon, RefreshIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface SearchPreviewProps {
  query: string;
  onReset: () => void;
}

export const SearchPreview: React.FC<SearchPreviewProps> = ({ query, onReset }) => {
  const { t } = useLocalization();
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">{t.livePreview}</h3>
      <div className="p-4 bg-kde-bg-light dark:bg-kde-bg-dark rounded-md font-mono text-sm break-all min-h-[50px] border border-kde-border-light dark:border-kde-border-dark">
        {query || <span className="text-gray-500">{t.queryPlaceholder}</span>}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <a
          href={query ? searchUrl : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 flex items-center justify-center gap-2 text-center bg-kde-accent text-white font-bold py-2 px-4 rounded-md hover:bg-kde-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark transition-all ${
            !query ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={(e) => !query && e.preventDefault()}
        >
          <SearchIcon className="h-5 w-5" />
          {t.searchOnGoogle}
        </a>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark transition-colors"
        >
          <RefreshIcon className="h-5 w-5" />
          {t.reset}
        </button>
      </div>
    </div>
  );
};
