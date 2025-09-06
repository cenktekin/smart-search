
import type { SearchOperator } from '../types';
import type { UiStringKeys } from './ui';

export interface ManifestoTemplatePart {
    type: 'operator';
    operatorId: SearchOperator['id'];
    value: string;
}

export interface Manifesto {
    id: string;
    nameKey: UiStringKeys;
    descriptionKey: UiStringKeys;
    template: ManifestoTemplatePart[];
}

export const MANIFESTOS: Manifesto[] = [
    {
        id: 'scientific',
        nameKey: 'manifestoScientificName',
        descriptionKey: 'manifestoScientificDesc',
        template: [
            { type: 'operator', operatorId: 'site', value: 'edu' },
            { type: 'operator', operatorId: 'or', value: 'OR' },
            { type: 'operator', operatorId: 'site', value: 'gov' },
            { type: 'operator', operatorId: 'filetype', value: 'pdf' },
        ],
    },
    {
        id: 'ethical',
        nameKey: 'manifestoEthicalName',
        descriptionKey: 'manifestoEthicalDesc',
        template: [
            { type: 'operator', operatorId: 'exclude', value: 'site:facebook.com' },
            { type: 'operator', operatorId: 'exclude', value: 'site:twitter.com' },
            { type: 'operator', operatorId: 'exclude', value: 'site:pinterest.com' },
        ],
    },
];
