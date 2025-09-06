export interface SearchOperator {
  id: string;
  operator: string;
  description: string;
  example: string;
  category: string;
  takesValue: boolean;
}

export interface QueryPart {
  id: string;
  type: 'operator' | 'text';
  value: string;
  operator?: SearchOperator;
  isManifestoPart?: boolean;
}
