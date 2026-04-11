import React from 'react';
import type { QueryPart } from '../types';
import { XIcon, LockIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface QueryPartTagProps {
  part: QueryPart;
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

export const QueryPartTag: React.FC<QueryPartTagProps> = ({ part, onUpdate, onRemove }) => {
  const { t } = useLocalization();
  const isOperator = part.type === 'operator';
  const operatorTakesValue = part.operator?.takesValue ?? false;
  const isManifestoPart = part.isManifestoPart ?? false;

  return (
    <div className={`flex items-center border rounded-md overflow-hidden shadow-sm h-10 ${isManifestoPart ? 'border-kde-accent bg-blue-50 dark:bg-blue-900/20' : 'bg-kde-panel-light dark:bg-kde-panel-dark border-kde-border-light dark:border-kde-border-dark'}`}>
      {isOperator && (
        <span className={`px-3 font-mono text-sm whitespace-nowrap ${operatorTakesValue ? 'bg-kde-accent text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
          {part.operator?.id === 'exact_term' ? '"' : part.operator?.operator}
        </span>
      )}
      
      {(!isOperator || operatorTakesValue) && (
        <input
          type="text"
          value={part.value}
          onChange={(e) => onUpdate(part.id, e.target.value)}
          placeholder={isOperator ? part.operator?.example : t.enterSearchTerm}
          className="px-2 py-1 bg-transparent text-kde-text-light dark:text-kde-text-dark focus:outline-none w-48"
          readOnly={isManifestoPart}
        />
      )}
      
      {isOperator && part.operator?.id === 'exact_term' && (
         <span className="px-3 font-mono text-sm whitespace-nowrap bg-kde-accent text-white">"</span>
      )}

      {isManifestoPart ? (
        <div className="p-2 text-kde-accent h-full flex items-center bg-gray-100 dark:bg-gray-700/50" title="This part is locked by the selected Manifesto.">
            <LockIcon className="h-4 w-4" />
        </div>
      ) : (
        <button
            onClick={() => onRemove(part.id)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-colors h-full"
            aria-label={t.removePart(part.value)}
        >
            <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
