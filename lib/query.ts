import type { QueryPart } from '../types';

let partCounter = 0;

const nextPartId = (prefix: string): string => {
  partCounter += 1;
  return `${prefix}-${Date.now()}-${partCounter}`;
};

export const createTextPart = (value = ''): QueryPart => ({
  id: nextPartId('text'),
  type: 'text',
  value,
});

export const buildSearchQuery = (parts: QueryPart[]): string =>
  parts
    .map(part => {
      if (part.type === 'text') {
        return part.value.trim();
      }
      if (!part.operator) {
        return '';
      }
      if (part.operator.id === 'exact_term') {
        return `"${part.value.trim()}"`;
      }
      if (part.operator.takesValue) {
        return `${part.operator.operator}${part.value.trim()}`;
      }
      return part.operator.operator;
    })
    .filter(Boolean)
    .join(' ');

export const readSharedQuery = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const shared = new URLSearchParams(window.location.search).get('q');
  const trimmed = shared?.trim();
  return trimmed ? trimmed : null;
};

export const writeSharedQuery = (query: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set('q', query);
  } else {
    url.searchParams.delete('q');
  }
  window.history.replaceState(window.history.state, '', url);
};
