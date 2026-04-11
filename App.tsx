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

// Define the type for the AI's structured response
interface AIResponsePart {
  type: 'operator' | 'text';
  value: string;
  operatorId?: string; // Keep operatorId for now, as the AI might still return it.
}

const App: React.FC = () => {
  const { t, OPERATORS, OPERATOR_CATEGORIES } = useLocalization();

  // Helper function for retry logic with timeout integration
  const retryFetch = async (url: string, options: RequestInit, maxRetries: number, baseDelay: number) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutMs = url.includes('/chat/completions') ? 30000 : 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status >= 500 || response.status === 0) { // 5xx or network error
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error(`API error after ${maxRetries} retries: ${response.status} ${response.statusText}`);
          } else {
            // 4xx or other client errors, don't retry
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Client error: ${response.status} ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
          }
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`Timeout after ${maxRetries} retries: ${timeoutMs}ms timeout exceeded.`);
        } else if (attempt < maxRetries) {
          // Other network errors, retry
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      return (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'light';
    }
    return 'light';
  });

  const [queryParts, setQueryParts] = useState<QueryPart[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedQuery = window.localStorage.getItem('searchQuery');
      try {
        const parsed = savedQuery ? JSON.parse(savedQuery) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse search query from localStorage", e);
      }
    }
    return [{ id: `text-${Date.now()}`, type: 'text', value: '' }];
  });

  const [activeCategory, setActiveCategory] = useState<string>(OPERATOR_CATEGORIES[0]);
  const [selectedManifesto, setSelectedManifesto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-oss-20b:free"); // Default model

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await retryFetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          },
        }, 2, 500);
        const data = await response.json();
        setAvailableModels(data.data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userQueryParts = queryParts.filter(p => !p.isManifestoPart);
      if (userQueryParts.length > 0) {
        window.localStorage.setItem('searchQuery', JSON.stringify(userQueryParts));
      } else {
        window.localStorage.removeItem('searchQuery');
      }
    }
  }, [queryParts]);

  useEffect(() => {
    setActiveCategory(OPERATOR_CATEGORIES[0]);
  }, [OPERATOR_CATEGORIES]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleManifestoChange = useCallback((manifestoId: string | null) => {
    setSelectedManifesto(manifestoId);

    setQueryParts(currentParts => {
      const userParts = currentParts.filter(p => !p.isManifestoPart);

      const ensuredUserParts = userParts.length === 0 || (userParts.length === 1 && userParts[0].value.trim() === '')
        ? [{ id: `text-${Date.now()}`, type: 'text' as 'text', value: '' }]
        : userParts;

      if (!manifestoId) {
        return ensuredUserParts;
      }

      const manifesto = MANIFESTOS.find(m => m.id === manifestoId);
      if (!manifesto) {
        return ensuredUserParts;
      }

      const manifestoQueryParts: QueryPart[] = manifesto.template.map((part, index): QueryPart | null => {
        const operator = OPERATORS.find(op => op.id === part.operatorId);
        if (!operator) return null;

        return {
          id: `manifesto-${manifestoId}-${index}-${Date.now()}`,
          type: 'operator',
          value: operator.takesValue ? part.value : operator.operator,
          operator,
          isManifestoPart: true,
        };
      }).filter((p): p is QueryPart => p !== null);

      return [...manifestoQueryParts, ...ensuredUserParts];
    });
  }, [OPERATORS]);

  const addOperator = useCallback((operator: SearchOperator) => {
    setQueryParts(prev => {
      const lastPart = prev[prev.length - 1];

      if (operator.takesValue && lastPart && lastPart.type === 'text' && lastPart.value.trim() !== '' && !lastPart.isManifestoPart) {
        const newQuery = [...prev];
        const transformedPart: QueryPart = {
          ...lastPart,
          type: 'operator',
          operator: operator,
        };
        newQuery[newQuery.length - 1] = transformedPart;
        return newQuery;
      }

      const newOperatorPart: QueryPart = operator.takesValue
        ? { id: `op-${operator.id}-${Date.now()}`, type: 'operator', operator, value: '' }
        : { id: `op-${operator.id}-${Date.now()}`, type: 'operator', operator, value: operator.operator };

      const userParts = prev.filter(p => !p.isManifestoPart);
      if (userParts.length === 1 && userParts[0].type === 'text' && userParts[0].value.trim() === '') {
        const manifestoParts = prev.filter(p => p.isManifestoPart);
        const newQuery = [...manifestoParts, newOperatorPart];
        if (!operator.takesValue) {
          newQuery.push({ id: `text-${Date.now()}`, type: 'text', value: '' });
        }
        return newQuery;
      }

      const newQuery = [...prev, newOperatorPart];
      if (!operator.takesValue) {
        newQuery.push({ id: `text-${Date.now()}`, type: 'text', value: '' });
      }
      return newQuery;
    });
  }, []);

  const addTextPart = useCallback(() => {
    setQueryParts(prev => [...prev, { id: `text-${Date.now()}`, type: 'text', value: '' }]);
  }, []);

  const removeQueryPart = useCallback((id: string) => {
    setQueryParts(prev => {
      const partToRemove = prev.find(p => p.id === id);
      if (partToRemove?.isManifestoPart) return prev;

      const remaining = prev.filter(part => part.id !== id);
      const userPartsRemaining = remaining.filter(p => !p.isManifestoPart);

      if (userPartsRemaining.length === 0) {
        const manifestoParts = prev.filter(p => p.isManifestoPart);
        return [...manifestoParts, { id: `text-${Date.now()}`, type: 'text', value: '' }];
      }
      return remaining;
    });
  }, []);

  const updateQueryPartValue = useCallback((id: string, value: string) => {
    setQueryParts(prev => prev.map(part => part.id === id ? { ...part, value } : part));
  }, []);

  const resetQuery = useCallback(() => {
    setQueryParts([{ id: `text-${Date.now()}`, type: 'text', value: '' }]);
    setSelectedManifesto(null);
    setAiError(null);
  }, []);

  const handleGenerateAIQuery = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setAiError(null);
    setSelectedManifesto(null); // Reset manifesto mode when using AI

    try {
      console.log("🔍 [DEBUG] Original prompt:", prompt);
      
      const availableOperators = OPERATORS.map(op => ({ id: op.id, operator: op.operator, description: op.description, takesValue: op.takesValue }));

      const systemInstruction = `You are an expert search query assistant. Your task is to convert a user's request into a structured Google search query.

INSTRUCTIONS:
1. Analyze the user's request and break it down into meaningful search terms
2. Use the available operators to create an effective search query
3. Return ONLY a valid JSON array - no explanations, no additional text
4. Do NOT repeat the user's request verbatim

JSON SCHEMA:
[
  {
    "type": "text" | "operator",
    "value": "string",
    "operatorId": "string (only for operator type)"
  }
]

RULES:
- For text parts: type "text", value contains the search term
- For operators: type "operator", value contains the parameter, operatorId matches available operator
- Use exact_term operator for phrases that should be searched exactly
- Use exclude operator to exclude specific terms
- Use intitle: operator to search within titles
- Use site: operator to search within specific sites
- Combine terms logically with AND (implicit) or explicit operators

EXAMPLE:
User request: "SWOT analysis presentation template"
Response: [
  {"type": "text", "value": "SWOT analysis"},
  {"type": "text", "value": "presentation"},
  {"type": "text", "value": "template"}
]

User request: "marketing site:harvard.edu"
Response: [
  {"type": "text", "value": "marketing"},
  {"type": "operator", "value": "harvard.edu", "operatorId": "site"}
]`;

      const processedPromptParts: { type: 'text' | 'operator', value: string, operatorId?: string }[] = [];
      let remainingPrompt = prompt;

      console.log("🔍 [DEBUG] Processing prompt:", remainingPrompt);

      // Regex for intitle:, site:, and - (exclude)
      const operatorRegex = /(intitle:|site:|-)(\S+)/g;
      let match;
      let lastIndex = 0;

      while ((match = operatorRegex.exec(remainingPrompt)) !== null) {
        // Add text before the operator
        if (match.index > lastIndex) {
          const textBefore = remainingPrompt.substring(lastIndex, match.index).trim();
          if (textBefore) {
            processedPromptParts.push({ type: 'text', value: textBefore });
            console.log("🔍 [DEBUG] Added text part:", textBefore);
          }
        }

        const operatorPrefix = match[1];
        const operatorValue = match[2];

        if (operatorPrefix === '-') {
          processedPromptParts.push({ type: 'operator', operatorId: 'exclude', value: operatorValue });
          console.log("🔍 [DEBUG] Added exclude operator:", operatorValue);
        } else if (operatorPrefix === 'intitle:') {
          processedPromptParts.push({ type: 'operator', operatorId: 'intitle', value: operatorValue });
          console.log("🔍 [DEBUG] Added intitle operator:", operatorValue);
        } else if (operatorPrefix === 'site:') {
          processedPromptParts.push({ type: 'operator', operatorId: 'site', value: operatorValue });
          console.log("🔍 [DEBUG] Added site operator:", operatorValue);
        }
        lastIndex = operatorRegex.lastIndex;
      }

      // Add any remaining text
      if (lastIndex < remainingPrompt.length) {
        const remainingText = remainingPrompt.substring(lastIndex).trim();
        if (remainingText) {
          processedPromptParts.push({ type: 'text', value: remainingText });
          console.log("🔍 [DEBUG] Added remaining text:", remainingText);
        }
      }

      // Filter out empty text parts
      const filteredProcessedPromptParts = processedPromptParts.filter(part => part.value !== '');
      console.log("🔍 [DEBUG] Filtered prompt parts:", filteredProcessedPromptParts);

      const fullPrompt = `Convert this user request into a structured Google search query using the available operators:

User request: "${prompt}"

Available operators: ${JSON.stringify(availableOperators, null, 2)}

Return ONLY a valid JSON array with no additional text or explanations.`;
      console.log("🔍 [DEBUG] Full prompt sent to AI:", fullPrompt);

      const postOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel, // Use the selected model
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: fullPrompt }
          ],
          response_format: { type: "json_object" }, // Request JSON object response
        }),
      };

      const response = await retryFetch('https://openrouter.ai/api/v1/chat/completions', postOptions, 3, 1000);

      const data = await response.json();
      const responseText = data.choices[0].message.content.trim();
      console.log("🔍 [DEBUG] AI response text:", responseText);
      
      let generatedParts: AIResponsePart[] = [];
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) {
          generatedParts = parsed;
        } else {
          // If not an array, try to extract JSON from text
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            generatedParts = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      } catch (parseError) {
        console.error("🔍 [DEBUG] JSON parse error:", parseError);
        // Fallback: create text part from original prompt
        generatedParts = [{ type: 'text', value: prompt }];
      }
      
      console.log("🔍 [DEBUG] Parsed AI response parts:", generatedParts);

      const newQueryParts: QueryPart[] = generatedParts.map((part, index) => {
        // Validate part structure
        if (!part.type || !part.value) {
          console.log("🔍 [DEBUG] Invalid part structure, fallback to text:", part);
          return {
            id: `ai-fallback-${index}-${Date.now()}`,
            type: 'text',
            value: prompt, // Use original prompt as fallback
          };
        }

        if (part.type === 'operator' && part.operatorId) {
          const operator = OPERATORS.find(op => op.id === part.operatorId);
          if (operator) {
            const queryPart = {
              id: `ai-op-${index}-${Date.now()}`,
              type: 'operator',
              operator,
              value: part.value,
            };
            console.log("🔍 [DEBUG] Created operator part:", queryPart);
            return queryPart;
          } else {
            console.log("🔍 [DEBUG] Operator not found for ID:", part.operatorId, "fallback to text");
            // Fallback to text if operator not found
            return {
              id: `ai-text-${index}-${Date.now()}`,
              type: 'text',
              value: part.value,
            };
          }
        }
        
        const textPart = {
          id: `ai-text-${index}-${Date.now()}`,
          type: 'text',
          value: part.value,
        };
        console.log("🔍 [DEBUG] Created text part:", textPart);
        return textPart;
      });

      console.log("🔍 [DEBUG] Final query parts:", newQueryParts);
      setQueryParts(newQueryParts);

    } catch (error) {
      if (error.message.includes('Timeout')) {
        setAiError('Timeout: AI sorgu üretimi 30 saniye içinde tamamlanamadı.');
      } else {
        console.error("AI query generation failed:", error);
        setAiError(t.aiErrorBody);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [OPERATORS, t.aiErrorBody, selectedModel]);

  const filteredOperators = useMemo(() => {
    if (activeCategory === OPERATOR_CATEGORIES[0]) {
      return OPERATORS;
    }
    return OPERATORS.filter(op => op.category === activeCategory);
  }, [activeCategory, OPERATORS, OPERATOR_CATEGORIES]);

  const searchQuery = useMemo(() => {
    const query = queryParts
      .map(part => {
        if (part.type === 'text') {
          return part.value.trim();
        }
        if (part.operator) {
          if (part.operator.id === 'exact_term') {
            return `"${part.value.trim()}"`;
          }
          if (part.operator.takesValue) {
            return `${part.operator.operator}${part.value.trim()}`;
          }
          return part.operator.operator;
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
    
    console.log("🔍 [DEBUG] Generated search query:", query);
    return query;
  }, [queryParts]);

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
              onSelectModel={setSelectedModel}
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
              href="https://github.com/cenktekin/smart-search-operator-page"
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