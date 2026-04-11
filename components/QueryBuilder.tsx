
import React from 'react';
import type { QueryPart } from '../types';
import { QueryPartTag } from './QueryPartTag';
import { PlusIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface QueryBuilderProps {
  parts: QueryPart[];
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onAddText: () => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ parts, onUpdate, onRemove, onAddText }) => {
  const { t } = useLocalization();
  return (
    <div className="bg-kde-bg-light dark:bg-kde-bg-dark p-4 rounded-lg border-2 border-dashed border-kde-border-light dark:border-kde-border-dark min-h-[100px] flex flex-wrap items-center gap-2">
      {parts.map(part => (
        <QueryPartTag
          key={part.id}
          part={part}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
       <button 
        onClick={onAddText}
        className="p-1.5 rounded-full bg-kde-accent text-white hover:bg-kde-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-bg-light dark:focus:ring-offset-kde-bg-dark transition-colors"
        aria-label={t.addTextPart}
        >
            <PlusIcon className="h-5 w-5"/>
        </button>
    </div>
  );
};
