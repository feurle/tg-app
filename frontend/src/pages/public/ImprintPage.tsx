import { useTranslation } from 'react-i18next';
import ArticleBlock from '../../features/webcontent/components/ArticleBlock';
import { usePublishedArticles } from '../../features/webcontent/usePublishedArticles';

export default function ImprintPage() {
  const { t } = useTranslation();
  const { articles, loading, fallback } = usePublishedArticles('imprint');

  return (
    <div className="about-page">
      <div className="legal-feed">
        <header className="public-page-header">
          <h1 className="public-page-title">{t('footer.imprint')}</h1>
        </header>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <>
            {fallback && <p className="language-fallback">{t('pages.fallbackNotice')}</p>}
            {articles.map((article) => (
              <ArticleBlock key={article.id} article={article} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
