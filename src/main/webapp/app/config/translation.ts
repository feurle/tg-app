import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// German
import de_common from '../../i18n/de/common.json'
import de_navbar from '../../i18n/de/navbar.json'
import de_home from '../../i18n/de/home.json'
import de_news from '../../i18n/de/news.json'
import de_articles from '../../i18n/de/articles.json'
import de_images from '../../i18n/de/images.json'
import de_customers from '../../i18n/de/customers.json'
import de_users from '../../i18n/de/users.json'
import de_login from '../../i18n/de/login.json'

// English
import en_common from '../../i18n/en/common.json'
import en_navbar from '../../i18n/en/navbar.json'
import en_home from '../../i18n/en/home.json'
import en_news from '../../i18n/en/news.json'
import en_articles from '../../i18n/en/articles.json'
import en_images from '../../i18n/en/images.json'
import en_customers from '../../i18n/en/customers.json'
import en_users from '../../i18n/en/users.json'
import en_login from '../../i18n/en/login.json'

// Swedish
import sv_common from '../../i18n/sv/common.json'
import sv_navbar from '../../i18n/sv/navbar.json'
import sv_home from '../../i18n/sv/home.json'
import sv_news from '../../i18n/sv/news.json'
import sv_articles from '../../i18n/sv/articles.json'
import sv_images from '../../i18n/sv/images.json'
import sv_customers from '../../i18n/sv/customers.json'
import sv_users from '../../i18n/sv/users.json'
import sv_login from '../../i18n/sv/login.json'

// Russian
import ru_common from '../../i18n/ru/common.json'
import ru_navbar from '../../i18n/ru/navbar.json'
import ru_home from '../../i18n/ru/home.json'
import ru_news from '../../i18n/ru/news.json'
import ru_articles from '../../i18n/ru/articles.json'
import ru_images from '../../i18n/ru/images.json'
import ru_customers from '../../i18n/ru/customers.json'
import ru_users from '../../i18n/ru/users.json'
import ru_login from '../../i18n/ru/login.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: {
        common: de_common,
        navbar: de_navbar,
        home: de_home,
        news: de_news,
        articles: de_articles,
        images: de_images,
        customers: de_customers,
        users: de_users,
        login: de_login,
      },
      en: {
        common: en_common,
        navbar: en_navbar,
        home: en_home,
        news: en_news,
        articles: en_articles,
        images: en_images,
        customers: en_customers,
        users: en_users,
        login: en_login,
      },
      sv: {
        common: sv_common,
        navbar: sv_navbar,
        home: sv_home,
        news: sv_news,
        articles: sv_articles,
        images: sv_images,
        customers: sv_customers,
        users: sv_users,
        login: sv_login,
      },
      ru: {
        common: ru_common,
        navbar: ru_navbar,
        home: ru_home,
        news: ru_news,
        articles: ru_articles,
        images: ru_images,
        customers: ru_customers,
        users: ru_users,
        login: ru_login,
      },
    },
    fallbackLng: 'de',
    supportedLngs: ['de', 'en', 'sv', 'ru'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n
