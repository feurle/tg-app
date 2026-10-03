import type { ArticleType } from './types';

/** Article types that `PageBlocks` renders; other types are shown by their own pages (news, privacy, ...). */
export const BLOCK_TYPES: ReadonlySet<ArticleType> = new Set<ArticleType>([
    'HERO_PORTRAIT', 'SYMPTOMS', 'METHODS', 'ABOUT_TEASER', 'STEPS', 'VET_BAND', 'HERO', 'COL2', 'COL3', 'COL4', 'TEXT',
]);
