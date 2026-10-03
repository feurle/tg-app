import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../router/routes';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 60px)' }}>
      <section className="home-section">
        <h1 className="home-heading">{t('notFound.title')}</h1>
        <p className="home-lead">{t('notFound.text')}</p>
        <Link to={ROUTES.HOME} className="btn-primary btn-large">
          {t('notFound.back')}
        </Link>
      </section>
    </div>
  );
}
