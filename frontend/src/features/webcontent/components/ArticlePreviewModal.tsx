import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArticleResponse } from '../types';
import PageBlocks from './PageBlocks';

interface Props {
  article: ArticleResponse;
  onClose: () => void;
}

/** One article rendered exactly as on the public site (same blocks as `PageBlocks`). */
export default function ArticlePreviewModal({ article, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="preview-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="preview-banner">
          <span>{t('article.previewBanner')}</span>
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.close')}</button>
        </div>
        <div className="preview-body">
          <PageBlocks articles={[article]} />
        </div>
      </div>
    </div>
  );
}
