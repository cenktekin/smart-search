
import React from 'react';
import type { SearchOperator } from '../types';
import { PlusIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface OperatorCardProps {
  operator: SearchOperator;
  onAdd: (operator: SearchOperator) => void;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({ operator, onAdd }) => {
  const { t } = useLocalization();
  return (
    <div className="bg-kde-panel-light dark:bg-kde-panel-dark p-2 rounded-lg border border-kde-border-light dark:border-kde-border-dark shadow-sm hover:shadow-lg hover:border-kde-accent transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-kde-accent">{operator.operator}</h3>
            <span className="text-xs font-semibold bg-kde-bg-light dark:bg-kde-bg-dark px-2 py-0.5 rounded-full border border-kde-border-light dark:border-kde-border-dark">{operator.category}</span>
        </div>
        <p className="text-xs mt-1.5 text-kde-text-light dark:text-kde-text-dark">{operator.description}</p>
        <p className="text-xs mt-1.5 italic text-gray-500 dark:text-gray-400">
          e.g., <code className="bg-kde-bg-light dark:bg-kde-bg-dark p-1 rounded">{operator.example}</code>
        </p>
      </div>
      <button
        onClick={() => onAdd(operator)}
        className="mt-2 w-full flex items-center justify-center gap-1 bg-kde-accent text-white font-bold py-1 px-2 text-xs rounded-md hover:bg-kde-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark transition-colors duration-200"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        {t.addToQuery}
      </button>
    </div>
  );
};
