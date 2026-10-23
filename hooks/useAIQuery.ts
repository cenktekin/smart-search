import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QueryPart, SearchOperator } from '../types';
import { buildSystemInstruction, buildUserPrompt, parseAIResponse } from '../lib/ai';
import { retryFetch, TimeoutError } from '../lib/http';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export const DEFAULT_MODEL = 'openai/gpt-oss-20b:free';

export interface AIModel {
  id: string;
}

interface UseAIQueryOptions {
  operators: SearchOperator[];
  apiKeyMissingError: string;
  timeoutError: string;
  genericError: string;
}

interface UseAIQueryResult {
  models: AIModel[];
  selectedModel: string;
  selectModel: (modelId: string) => void;
  isGenerating: boolean;
  error: string | null;
  generate: (prompt: string) => Promise<QueryPart[] | null>;
}

export const useAIQuery = ({
  operators,
  apiKeyMissingError,
  timeoutError,
  genericError,
}: UseAIQueryOptions): UseAIQueryResult => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;

    const fetchModels = async () => {
      try {
        const response = await retryFetch(
          `${OPENROUTER_BASE}/models`,
          { headers: { Authorization: `Bearer ${apiKey}` } },
          2,
          500
        );
        const payload: { data?: AIModel[] } = await response.json();
        if (!cancelled && Array.isArray(payload.data)) {
          setModels(payload.data);
        }
      } catch (caught) {
        if (!cancelled) {
          console.error('Could not load the OpenRouter model list', caught);
        }
      }
    };

    void fetchModels();

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const generate = useCallback(
    async (prompt: string): Promise<QueryPart[] | null> => {
      if (!apiKey) {
        setError(apiKeyMissingError);
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const response = await retryFetch(
          `${OPENROUTER_BASE}/chat/completions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                { role: 'system', content: buildSystemInstruction(operators) },
                { role: 'user', content: buildUserPrompt(prompt) },
              ],
              response_format: { type: 'json_object' },
            }),
          },
          3,
          1000
        );

        const payload = await response.json();
        const responseText: string = payload?.choices?.[0]?.message?.content ?? '';
        return parseAIResponse(responseText, operators, prompt);
      } catch (caught) {
        if (caught instanceof TimeoutError) {
          setError(timeoutError);
        } else {
          setError(genericError);
          console.error('AI query generation failed', caught);
        }
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [apiKey, apiKeyMissingError, timeoutError, genericError, operators, selectedModel]
  );

  const modelOptions = useMemo(
    () => (models.length > 0 ? models : [{ id: DEFAULT_MODEL }]),
    [models]
  );

  return {
    models: modelOptions,
    selectedModel,
    selectModel: setSelectedModel,
    isGenerating,
    error,
    generate,
  };
};
