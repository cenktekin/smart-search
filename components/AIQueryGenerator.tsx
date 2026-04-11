import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { SparklesIcon, SpinnerIcon } from './icons/Icons';

interface AIQueryGeneratorProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  error: string | null;
  availableModels: any[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const AIQueryGenerator: React.FC<AIQueryGeneratorProps> = ({ onGenerate, isGenerating, error, availableModels, selectedModel, onSelectModel }) => {
  const { t } = useLocalization();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="bg-kde-panel-light dark:bg-kde-panel-dark p-6 rounded-lg border border-kde-border-light dark:border-kde-border-dark shadow-md">
      <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
        <SparklesIcon className="h-6 w-6 text-kde-accent" />
        {t.aiQueryAssistant}
      </h2>

      <div className="mb-4">
        <label htmlFor="model-select" className="block text-sm font-medium text-kde-text-light dark:text-kde-text-dark mb-1">
          {t.selectAIModel}
        </label>
        <select
          id="model-select"
          className="w-full p-2 rounded-md bg-kde-bg-light dark:bg-kde-bg-dark border border-kde-border-light dark:border-kde-border-dark focus:outline-none focus:ring-2 focus:ring-kde-accent"
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
          disabled={isGenerating}
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.aiPromptPlaceholder}
          className="w-full h-24 p-2 rounded-md bg-kde-bg-light dark:bg-kde-bg-dark border border-kde-border-light dark:border-kde-border-dark focus:outline-none focus:ring-2 focus:ring-kde-accent"
          disabled={isGenerating}
        />

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-md text-red-700 dark:text-red-300">
            <p className="font-bold">{t.aiErrorTitle}</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-kde-accent text-white font-bold py-2 px-4 rounded-md hover:bg-kde-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kde-accent focus:ring-offset-kde-panel-light dark:focus:ring-offset-kde-panel-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <SpinnerIcon className="h-5 w-5" />
              {t.generating}
            </>
          ) : (
            t.generateQuery
          )}
        </button>
      </form>
    </div>
  );
};
