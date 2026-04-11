
import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { MANIFESTOS } from '../locales/manifestos';

interface ManifestoModeSelectorProps {
  selectedManifesto: string | null;
  onSelect: (id: string | null) => void;
}

export const ManifestoModeSelector: React.FC<ManifestoModeSelectorProps> = ({ selectedManifesto, onSelect }) => {
  const { t } = useLocalization();

  const selectedManifestoDetails = selectedManifesto ? MANIFESTOS.find(m => m.id === selectedManifesto) : null;

  return (
    <div className="space-y-1">
      <label htmlFor="manifesto-select" className="block text-sm font-bold text-kde-text-light dark:text-kde-text-dark sr-only">
        {t.searchManifesto}
      </label>
      <select
        id="manifesto-select"
        value={selectedManifesto ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full p-2 rounded-md bg-kde-bg-light dark:bg-kde-bg-dark border border-kde-border-light dark:border-kde-border-dark focus:outline-none focus:ring-2 focus:ring-kde-accent"
      >
        <option value="">{t.standardMode}</option>
        {MANIFESTOS.map((manifesto) => (
          <option key={manifesto.id} value={manifesto.id}>
            {t[manifesto.nameKey]}
          </option>
        ))}
      </select>
      {selectedManifestoDetails && (
         <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
            {t[selectedManifestoDetails.descriptionKey]}
        </p>
      )}
    </div>
  );
};
