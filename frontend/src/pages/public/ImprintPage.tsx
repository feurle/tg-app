import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pageApi } from '../../features/webcontent/api';
import type { ArticleResponse } from '../../features/webcontent/types';
import ArticleBlock from '../../features/webcontent/components/ArticleBlock';
import { resolveLanguage } from '../../features/webcontent/language';

export default function ImprintPage() {
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [fetchedLanguage, setFetchedLanguage] = useState<string | null>(null);
  const { t, i18n: i18nInstance } = useTranslation();
  const language = resolveLanguage(i18nInstance.language);
  const loading = fetchedLanguage !== language;

  useEffect(() => {
    let cancelled = false;
    pageApi.getBySlug('imprint')
      .then((page) => {
        if (!cancelled) {
          setArticles(
            page.articles.filter(
              (a) => a.state === 'PUBLISHED' && a.language === language,
            ),
          );
          setFetchedLanguage(language);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticles([]);
          setFetchedLanguage(language);
        }
      });
    return () => { cancelled = true; };
  }, [language]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 60px)' }}>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
            articles.map((article) => (
              <ArticleBlock key={article.id} article={article} />
            ))
        )}
    </div>
  );
}
