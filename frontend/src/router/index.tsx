import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layout/PublicLayout';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/public/HomePage';
import NewsPage from '../pages/public/NewsPage';
import AboutPage from '../pages/public/AboutPage';
import PrivacyPage from '../pages/public/PrivacyPage';
import ImprintPage from '../pages/public/ImprintPage';
import ContactPage from '../pages/public/ContactPage';
import ForPetOwnersPage from '../pages/public/ForPetOwnersPage';
import ForVetsPage from '../pages/public/ForVetsPage';
import QuestionnairePage from '../pages/public/QuestionnairePage';
import QuestionnairesPage from '../pages/protected/QuestionnairesPage';
import CustomersPage from '../pages/protected/CustomersPage';
import UsersPage from '../pages/protected/UsersPage';
import ArticlesPage from '../pages/protected/ArticlesPage.tsx'; 
import ImagesPage from '../pages/protected/ImagesPage';
import TagsPage from '../pages/protected/TagsPage';
import ContactInfoPage from '../pages/protected/ContactInfoPage';
import { ROUTES } from './routes';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.FOR_PET_OWNERS, element: <ForPetOwnersPage /> },
      { path: ROUTES.FOR_VETS, element: <ForVetsPage /> },
      { path: ROUTES.QUESTIONNAIRE, element: <QuestionnairePage /> },
      { path: ROUTES.NEWS, element: <NewsPage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.PRIVACY, element: <PrivacyPage /> },
      { path: ROUTES.IMPRESS, element: <ImprintPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> }
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.CUSTOMERS, element: <CustomersPage /> },
          { path: ROUTES.USERS, element: <UsersPage /> },
          { path: ROUTES.QUESTIONNAIRES, element: <QuestionnairesPage /> },
          { path: ROUTES.PAGE_HOME, element: <ArticlesPage slug="home" /> },
          { path: ROUTES.PAGE_NEWS, element: <ArticlesPage slug="news" /> },
          { path: ROUTES.PAGE_ABOUT, element: <ArticlesPage slug="about" /> },
          { path: ROUTES.PAGE_PRIVACY, element: <ArticlesPage slug="privacy" /> },
          { path: ROUTES.PAGE_IMPRINT, element: <ArticlesPage slug="imprint" /> },
          { path: ROUTES.PAGE_CONTACT, element: <ArticlesPage slug="contact" /> },
          { path: ROUTES.IMAGES, element: <ImagesPage /> },
          { path: ROUTES.TAGS, element: <TagsPage /> },
          { path: ROUTES.CONTACT_INFO, element: <ContactInfoPage /> },
        ],
      },
    ],
  },
]);

export default router;
