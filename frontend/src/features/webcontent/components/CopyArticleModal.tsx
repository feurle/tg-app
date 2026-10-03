import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArticleResponse, Language } from '../types';

const LANGUAGE_VALUES: Language[] = ['GERMAN', 'ENGLISH', 'SWEDISH', 'RUSSIAN'];

interface Props {
  article: ArticleResponse;
  onCopy: (language: Language) => void;
  onCancel: () => void;
  saving: boolean;
}

/** Asks for the target language of a copy. The copy is a draft at the end of that language's list. */
export default function CopyArticleModal({ article, onCopy, onCancel, saving }: Props) {
  const { t } = useTranslation();
  const targets = LANGUAGE_VALUES.filter((l) => l !== article.language);
  const [language, setLanguage] = useState<Language>(targets[0]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '0.5rem' }}>{t('article.copyHeading')}</h2>
        <p style={{ marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
          „{article.title}“ – {t('article.copyHint')}
        </p>
        <label className="form-label">
          {t('article.copyTo')}
          <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            {targets.map((l) => (
              <option key={l} value={l}>{t(`article.language.${l}`)}</option>
            ))}
          </select>
        </label>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={() => onCopy(language)} disabled={saving} className="btn-accent">
            {saving ? t('common.saving') : t('article.copy')}
          </button>
        </div>
      </div>
    </div>
  );
}
