import type { Language } from './types';

export const LANGUAGE_MAP: Record<string, Language> = {
  de: 'GERMAN',
  en: 'ENGLISH',
  sv: 'SWEDISH',
  ru: 'RUSSIAN',
};

export const DEFAULT_LANGUAGE: Language = 'GERMAN';

export function resolveLanguage(param: string | null): Language {
  return (param !== null && LANGUAGE_MAP[param]) || DEFAULT_LANGUAGE;
}
