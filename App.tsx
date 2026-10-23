import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { QueryPart, SearchOperator } from './types';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { OperatorCard } from './components/OperatorCard';
import { QueryBuilder } from './components/QueryBuilder';
import { SearchPreview } from './components/SearchPreview';
import { ManifestoModeSelector } from './components/ManifestoModeSelector';
import { AIQueryGenerator } from './components/AIQueryGenerator';
import { GitHubIcon, BuyMeCoffeeIcon } from './components/icons/Icons';
import { useLocalization } from './contexts/LocalizationContext';
import { MANIFESTOS } from './locales/manifestos';
import { useAIQuery } from './hooks/useAIQuery';
import { buildSearchQuery, createTextPart, readSharedQuery, writeSharedQuery } from './lib/query';

const THEME_KEY = 'theme';
const QUERY_KEY = 'searchQuery';
const REPOSITORY_URL = 'https://github.com/cenktekin/smart-search';

const loadStoredTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'light';
  }
  return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
};

const loadInitialQueryParts = (): QueryPart[] => {
  const sharedQuery = readSharedQuery();
  if (sharedQuery) {
    return [createTextPart(sharedQuery)];
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return [createTextPart()];
  }

  const savedQuery = window.localStorage.getItem(QUERY_KEY);
  if (!savedQuery) {
    return [createTextPart()];
  }

  try {
    const parsed: unknown = JSON.parse(savedQuery);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as QueryPart[];
    }
  } catch (error) {
    console.error('Failed to read the stored search query', error);
  }

  return [createTextPart()];
};

const App: React.FC = () => {
  const { t, OPERATORS, OPERATOR_CATEGORIES } = useLocalization();

  const [theme, setTheme] = useState<'light' | 'dark'>(loadStoredTheme);
  const [queryParts, setQueryParts] = useState<QueryPart[]>(loadInitialQueryParts);
  const [activeCategory, setActiveCategory] = useState<string>(OPERATOR_CATEGORIES[0]);
  const [selectedManifesto, setSelectedManifesto] = useState<string | null>(null);

  const {
    models: availableModels,
    selectedModel,
    selectModel,
    isGenerating,
    error: aiError,
    generate,
  } = useAIQuery({
    operators: OPERATORS,
    apiKeyMissingError: t.apiKeyMissing,
    timeoutError: t.aiTimeoutError,
    genericError: t.aiErrorBody,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const userQueryParts = queryParts.filter(part => !part.isManifestoPart);
    if (userQueryParts.length > 0) {
      window.localStorage.setItem(QUERY_KEY, JSON.stringify(userQueryParts));
    } else {
      window.localStorage.removeItem(QUERY_KEY);
    }
  }, [queryParts]);

  useEffect(() => {
    setActiveCategory(OPERATOR_CATEGORIES[0]);
  }, [OPERATOR_CATEGORIES]);

  const toggleTheme = useCallback(() => {
    setTheme(previousTheme => (previousTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleManifestoChange = useCallback((manifestoId: string | null) => {
    setSelectedManifesto(manifestoId);

    setQueryParts(currentParts => {
      const userParts = currentParts.filter(part => !part.isManifestoPart);

      const ensuredUserParts = userParts.length === 0 || (userParts.length === 1 && userParts[0].value.trim() === '')
        ? [createTextPart()]
        : userParts;

      if (!manifestoId) {
        return ensuredUserParts;
      }

      const manifesto = MANIFESTOS.find(item => item.id === manifestoId);
      if (!manifesto) {
        return ensuredUserParts;
      }

      const manifestoQueryParts: QueryPart[] = manifesto.template
        .map((part, index): QueryPart | null => {
          const operator = OPERATORS.find(op => op.id === part.operatorId);
          if (!operator) {
            return null;
          }

          return {
            id: `manifesto-${manifestoId}-${index}-${Date.now()}`,
            type: 'operator',
            value: operator.takesValue ? part.value : operator.operator,
            operator,
            isManifestoPart: true,
          };
        })
        .filter((part): part is QueryPart => part !== null);

      return [...manifestoQueryParts, ...ensuredUserParts];
    });
  }, [OPERATORS]);

  const addOperator = useCallback((operator: SearchOperator) => {
    setQueryParts(previousParts => {
      const lastPart = previousParts[previousParts.length - 1];

      if (operator.takesValue && lastPart && lastPart.type === 'text' && lastPart.value.trim() !== '' && !lastPart.isManifestoPart) {
        const updatedParts = [...previousParts];
        updatedParts[updatedParts.length - 1] = { ...lastPart, type: 'operator', operator };
        return updatedParts;
      }

      const newOperatorPart: QueryPart = operator.takesValue
        ? { id: `op-${operator.id}-${Date.now()}`, type: 'operator', operator, value: '' }
        : { id: `op-${operator.id}-${Date.now()}`, type: 'operator', operator, value: operator.operator };

      const userParts = previousParts.filter(part => !part.isManifestoPart);
      const manifestoParts = previousParts.filter(part => part.isManifestoPart);

      if (userParts.length === 1 && userParts[0].type === 'text' && userParts[0].value.trim() === '') {
        const nextParts = [...manifestoParts, newOperatorPart];
        if (!operator.takesValue) {
          nextParts.push(createTextPart());
        }
        return nextParts;
      }

      const nextParts = [...previousParts, newOperatorPart];
      if (!operator.takesValue) {
        nextParts.push(createTextPart());
      }
      return nextParts;
    });
  }, []);

  const addTextPart = useCallback(() => {
    setQueryParts(previousParts => [...previousParts, createTextPart()]);
  }, []);

  const removeQueryPart = useCallback((id: string) => {
    setQueryParts(previousParts => {
      const partToRemove = previousParts.find(part => part.id === id);
      if (partToRemove?.isManifestoPart) {
        return previousParts;
      }

      const remaining = previousParts.filter(part => part.id !== id);
      const userPartsRemaining = remaining.filter(part => !part.isManifestoPart);

      if (userPartsRemaining.length === 0) {
        const manifestoParts = previousParts.filter(part => part.isManifestoPart);
        return [...manifestoParts, createTextPart()];
      }
      return remaining;
    });
  }, []);

  const updateQueryPartValue = useCallback((id: string, value: string) => {
    setQueryParts(previousParts => previousParts.map(part => (part.id === id ? { ...part, value } : part)));
  }, []);

  const resetQuery = useCallback(() => {
    setQueryParts([createTextPart()]);
    setSelectedManifesto(null);
  }, []);

  const handleGenerateAIQuery = useCallback(async (prompt: string) => {
    const generatedParts = await generate(prompt);
    if (!generatedParts) {
      return;
    }
    setSelectedManifesto(null);
    setQueryParts(generatedParts);
  }, [generate]);

  const filteredOperators = useMemo(() => {
    if (activeCategory === OPERATOR_CATEGORIES[0]) {
      return OPERATORS;
    }
    return OPERATORS.filter(op => op.category === activeCategory);
  }, [activeCategory, OPERATORS, OPERATOR_CATEGORIES]);

  const searchQuery = useMemo(() => buildSearchQuery(queryParts), [queryParts]);

  useEffect(() => {
    writeSharedQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col text-kde-text-light dark:text-kde-text-dark transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-kde-panel-light dark:bg-kde-panel-dark p-6 rounded-lg border border-kde-border-light dark:border-kde-border-dark shadow-md">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold flex-shrink-0">{t.queryBuilder}</h2>
                <div className="w-full md:w-auto md:min-w-[250px] md:max-w-xs">
                  <ManifestoModeSelector
                    selectedManifesto={selectedManifesto}
                    onSelect={handleManifestoChange}
                  />
                </div>
              </div>

              <QueryBuilder
                parts={queryParts}
                onUpdate={updateQueryPartValue}
                onRemove={removeQueryPart}
                onAddText={addTextPart}
              />
            </div>
            <div className="bg-kde-panel-light dark:bg-kde-panel-dark p-6 rounded-lg border border-kde-border-light dark:border-kde-border-dark shadow-md">
              <SearchPreview query={searchQuery} onReset={resetQuery} />
            </div>
          </div>
          <div className="space-y-6">
            <AIQueryGenerator
              onGenerate={handleGenerateAIQuery}
              isGenerating={isGenerating}
              error={aiError}
              availableModels={availableModels}
              selectedModel={selectedModel}
              onSelectModel={selectModel}
            />
            <div className="bg-kde-panel-light dark:bg-kde-panel-dark p-6 rounded-lg border border-kde-border-light dark:border-kde-border-dark shadow-md">
              <h2 className="text-2xl font-bold mb-4">{t.operatorLibrary}</h2>
              <CategoryFilter
                categories={OPERATOR_CATEGORIES}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredOperators.map(operator => (
                <OperatorCard key={operator.id} operator={operator} onAdd={addOperator} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-kde-panel-light dark:bg-kde-panel-dark border-t border-kde-border-light dark:border-kde-border-dark py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-kde-text-light dark:text-kde-text-dark hover:text-kde-accent transition-colors focus:outline-none focus:ring-2 focus:ring-kde-accent"
            >
              <GitHubIcon />
              GitHub
            </a>
            <span className="text-sm text-kde-border-light dark:text-kde-border-dark">•</span>
            <a
              href="https://buymeacoffee.com/cenktekin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-kde-text-light dark:text-kde-text-dark hover:text-kde-accent transition-colors focus:outline-none focus:ring-2 focus:ring-kde-accent"
            >
              <BuyMeCoffeeIcon />
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
