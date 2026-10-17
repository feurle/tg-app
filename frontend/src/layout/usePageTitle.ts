import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../router/routes';

/** i18n key of the page title per route; `null` keeps the plain site title (home page). */
const TITLE_KEYS: Record<string, string | null> = {
  [ROUTES.HOME]: null,
  [ROUTES.TREATMENTS]: 'nav.treatments',
  [ROUTES.FOR_VETS]: 'nav.forVets',
  [ROUTES.QUESTIONNAIRE]: 'questionnaire.page.title',
  [ROUTES.APPOINTMENT]: 'appointmentForm.title',
  [ROUTES.MESSAGE]: 'messageForm.title',
  [ROUTES.NEWS]: 'nav.news',
  [ROUTES.ABOUT]: 'nav.aboutMe',
  [ROUTES.PRIVACY]: 'footer.privacy',
  [ROUTES.IMPRESS]: 'footer.imprint',
  [ROUTES.CONTACT]: 'footer.contact',
};

/**
 * Sets `document.title` from the current route and language. Unknown public routes get the 404
 * title; pass `fixedKey` for areas that are not in the route map (e.g. the admin area).
 */
export function usePageTitle(fixedKey?: string) {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const key = fixedKey ?? (pathname in TITLE_KEYS ? TITLE_KEYS[pathname] : 'notFound.title');
    const site = t('app.name');
    document.title = key ? `${t(key)} – ${site}` : `${site} – ${t('app.claim')}`;
  }, [pathname, fixedKey, t, i18n.language]);
}
