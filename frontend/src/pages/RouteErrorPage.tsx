import { Link, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../router/routes';

/** Shown instead of a blank page when rendering a route throws. Self-contained: it must not depend on the layout that failed. */
export default function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <section className="home-section">
        <h1 className="home-heading">{t('routeError.title')}</h1>
        <p className="home-lead">{t('routeError.text')}</p>
        <a href={ROUTES.HOME} className="btn-primary btn-large">
          {t('routeError.reload')}
        </a>{' '}
        <Link to={ROUTES.CONTACT} className="home-more-link">
          {t('footer.contact')}
        </Link>
      </section>
    </div>
  );
}
