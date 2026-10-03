export const ROUTES = {
  HOME: '/',
  TREATMENTS: '/treatments',
  /** Legacy route, redirects to TREATMENTS. */
  FOR_PET_OWNERS: '/for-pet-owners',
  FOR_VETS: '/for-vets',
  QUESTIONNAIRE: '/questionnaire',
  NEWS: '/news',
  ABOUT: '/about',
  PRIVACY: '/privacy',
  IMPRESS: '/impress',
  CONTACT: '/contact',
  CUSTOMERS: '/customers',
  USERS: '/users',
  QUESTIONNAIRES: '/questionnaires',
  /** Admin view of one CMS page; use `adminPagePath(slug)` to build links. */
  PAGE: '/webcontent/page/:slug',
  IMAGES: '/webcontent/images',
  TAGS: '/webcontent/tags',
  CONTACT_INFO: '/contact-info',
} as const;

export const adminPagePath = (slug: string) => `/webcontent/page/${slug}`;
