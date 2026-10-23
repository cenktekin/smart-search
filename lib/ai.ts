import type { QueryPart, SearchOperator } from '../types';
import { createTextPart } from './query';

export interface AIResponsePart {
  type: 'operator' | 'text';
  value: string;
  operatorId?: string;
}

const formatCatalog = (operators: SearchOperator[]): string =>
  operators
    .map(op => `- "${op.id}" -> ${op.operator} (takes value: ${op.takesValue ? 'yes' : 'no'}) ${op.description}`)
    .join('\n');

export const buildSystemInstruction = (operators: SearchOperator[]): string => `You are an expert Google search query builder. Convert the user's request into structured query parts that use Google search operators correctly.

HOW TO RESPOND
Return ONLY a JSON object. No prose, no markdown, no code fences.
{"parts":[{"type":"text","value":"..."},{"type":"operator","value":"...","operatorId":"..."}]}

RULES
1. Split the request into meaningful search terms. Each term is a "text" part.
2. Use an "operator" part whenever the request implies a search operator:
   - a document or file format (pdf, docx, pptx, xlsx, csv) -> filetype
   - a specific website or domain -> site
   - a word that must appear in the page title -> intitle
   - a word that must appear in the URL -> inurl
   - sites similar to a given domain -> related
   - the definition of a term -> define
   - an exact phrase -> exact_term
   - a word the user wants to leave out -> exclude
   - "either X or Y" -> or
3. "value" must contain only the operand: no operator prefix, no surrounding quotes, no leading minus.
4. Never invent an operator. "operatorId" must be exactly one of the ids in the catalog below.
5. Keep the text values in the user's own language. Do not translate them.
6. Do not echo the whole request as a single text part when it can be split into terms.

EXAMPLES
User request: "pestle analysis pdf from harvard"
{"parts":[{"type":"text","value":"pestle analysis"},{"type":"operator","value":"pdf","operatorId":"filetype"},{"type":"operator","value":"harvard.edu","operatorId":"site"}]}

User request: "climate change articles without pinterest"
{"parts":[{"type":"text","value":"climate change"},{"type":"text","value":"articles"},{"type":"operator","value":"pinterest","operatorId":"exclude"}]}

CATALOG
${formatCatalog(operators)}`;

export const buildUserPrompt = (prompt: string): string => `User request: "${prompt}"

Return the JSON object described in the system instruction.`;

const stripCodeFence = (text: string): string =>
  text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

const extractParts = (payload: unknown): AIResponsePart[] | null => {
  if (Array.isArray(payload)) {
    return payload as AIResponsePart[];
  }
  if (payload && typeof payload === 'object') {
    const parts = (payload as { parts?: unknown }).parts;
    if (Array.isArray(parts)) {
      return parts as AIResponsePart[];
    }
  }
  return null;
};

const tryParseParts = (text: string): AIResponsePart[] | null => {
  try {
    return extractParts(JSON.parse(text));
  } catch {
    return null;
  }
};

const toQueryPart = (
  part: AIResponsePart,
  index: number,
  operators: SearchOperator[],
  fallbackText: string
): QueryPart => {
  const id = `ai-${index}-${Date.now()}`;
  const value = typeof part?.value === 'string' ? part.value.trim() : '';

  if (part?.type === 'operator' && value) {
    const operator = operators.find(op => op.id === part.operatorId);
    if (operator) {
      return { id, type: 'operator', operator, value };
    }
  }

  return { id, type: 'text', value: value || fallbackText };
};

export const parseAIResponse = (
  responseText: string,
  operators: SearchOperator[],
  fallbackText: string
): QueryPart[] => {
  const cleaned = stripCodeFence(responseText);
  const candidates = [
    cleaned,
    cleaned.match(/\[[\s\S]*\]/)?.[0],
    cleaned.match(/\{[\s\S]*\}/)?.[0],
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const parts = tryParseParts(candidate);
    if (!parts) {
      continue;
    }
    const validParts = parts.filter(part => part && typeof part.value === 'string');
    if (validParts.length > 0) {
      return validParts.map((part, index) => toQueryPart(part, index, operators, fallbackText));
    }
  }

  return [createTextPart(fallbackText)];
};
