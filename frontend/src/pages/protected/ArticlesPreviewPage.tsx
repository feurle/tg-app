import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pageApi } from '../../features/webcontent/api';
import { LANGUAGE_MAP, resolveLanguage } from '../../features/webcontent/language';
import type { PageResponse } from '../../features/webcontent/types';
import PageBlocks from '../../features/webcontent/components/PageBlocks';
import PageSkeleton from '../../components/PageSkeleton';
import { adminPagePath } from '../../router/routes';

/**
 * `/webcontent/page/:slug/preview?lang=de`: the whole page as visitors see it in one language,
 * including drafts and closed articles (the public endpoints only deliver published ones).
 */
export default function ArticlesPreviewPage() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { t } = useTranslation();
  const locale = params.get('lang') ?? 'de';
  const language = resolveLanguage(locale);
  const [page, setPage] = useState<PageResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pageApi
      .getBySlug(slug)
      .then((p) => !cancelled && setPage(p))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const articles = (page?.articles ?? [])
    .filter((a) => a.language === language)
    .sort((a, b) => a.order - b.order || a.id - b.id);
  const drafts = articles.filter((a) => a.state !== 'PUBLISHED').length;

  return (
    <>
      <div className="preview-banner">
        <span>
          {t('article.previewBanner')}
          {drafts > 0 && ` ${t('article.previewDrafts', { count: drafts })}`}
        </span>
        <div className="language-filter">
          {Object.keys(LANGUAGE_MAP).map((l) => (
            <button
              key={l}
              className={`lang-btn${l === locale ? ' lang-btn--active' : ''}`}
              onClick={() => setParams({ lang: l })}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <Link to={adminPagePath(slug)} className="btn-secondary">{t('article.previewBack')}</Link>
      </div>
      <div className="preview-body">
        {failed && <p style={{ color: 'var(--danger)' }}>{t('article.loadError')}</p>}
        {!page && !failed && <PageSkeleton />}
        {page && articles.length === 0 && <p>{t('article.previewEmpty')}</p>}
        {page && <PageBlocks articles={articles} />}
      </div>
    </>
  );
}
