import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PublicLayout from '../layout/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/public/HomePage';
import NewsPage from '../pages/public/NewsPage';
import AboutPage from '../pages/public/AboutPage';
import PrivacyPage from '../pages/public/PrivacyPage';
import ImprintPage from '../pages/public/ImprintPage';
import ContactPage from '../pages/public/ContactPage';
import TreatmentsPage from '../pages/public/TreatmentsPage';
import ForVetsPage from '../pages/public/ForVetsPage';
import ReferralPage from '../pages/public/ReferralPage';
import QuestionnairePage from '../pages/public/QuestionnairePage';
import AppointmentPage from '../pages/public/AppointmentPage';
import MessagePage from '../pages/public/MessagePage';
import NotFoundPage from '../pages/public/NotFoundPage';
import RouteErrorPage from '../pages/RouteErrorPage';
import PageSkeleton from '../components/PageSkeleton';
import { ROUTES } from './routes';

/**
 * The admin area (layout, pages, the Tiptap editor) is loaded on demand, so visitors of the public
 * pages do not download it (#151).
 */
const admin = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    // Shown while a lazy admin chunk loads on a direct visit or reload of an admin URL.
    hydrateFallbackElement: <PageSkeleton />,
    children: [
      {
        element: <PublicLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { path: ROUTES.HOME, element: <HomePage /> },
          { path: ROUTES.TREATMENTS, element: <TreatmentsPage /> },
          { path: ROUTES.FOR_PET_OWNERS, element: <Navigate to={ROUTES.TREATMENTS} replace /> },
          { path: ROUTES.FOR_VETS, element: <ForVetsPage /> },
          { path: ROUTES.REFERRAL, element: <ReferralPage /> },
          { path: ROUTES.QUESTIONNAIRE, element: <QuestionnairePage /> },
          { path: ROUTES.APPOINTMENT, element: <AppointmentPage /> },
          { path: ROUTES.MESSAGE, element: <MessagePage /> },
          { path: ROUTES.NEWS, element: <NewsPage /> },
          { path: ROUTES.ABOUT, element: <AboutPage /> },
          { path: ROUTES.PRIVACY, element: <PrivacyPage /> },
          { path: ROUTES.IMPRESS, element: <ImprintPage /> },
          { path: ROUTES.CONTACT, element: <ContactPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            lazy: admin(() => import('../layout/AppLayout')),
            children: [
              { path: ROUTES.CUSTOMERS, lazy: admin(() => import('../pages/protected/CustomersPage')) },
              { path: ROUTES.USERS, lazy: admin(() => import('../pages/protected/UsersPage')) },
              { path: ROUTES.QUESTIONNAIRES, lazy: admin(() => import('../pages/protected/QuestionnairesPage')) },
              { path: ROUTES.PAGE, lazy: admin(() => import('../pages/protected/ArticlesRoute')) },
              { path: ROUTES.PAGE_PREVIEW, lazy: admin(() => import('../pages/protected/ArticlesPreviewPage')) },
              { path: ROUTES.IMAGES, lazy: admin(() => import('../pages/protected/ImagesPage')) },
              { path: ROUTES.TAGS, lazy: admin(() => import('../pages/protected/TagsPage')) },
              { path: ROUTES.CONTACT_INFO, lazy: admin(() => import('../pages/protected/ContactInfoPage')) },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
