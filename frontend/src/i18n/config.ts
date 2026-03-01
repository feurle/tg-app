import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// German
import de_common from './de/common.json'
import de_navbar from './de/navbar.json'
import de_home from './de/home.json'
import de_news from './de/news.json'
import de_articles from './de/articles.json'
import de_images from './de/images.json'
import de_customers from './de/customers.json'
import de_users from './de/users.json'

// English
import en_common from './en/common.json'
import en_navbar from './en/navbar.json'
import en_home from './en/home.json'
import en_news from './en/news.json'
import en_articles from './en/articles.json'
import en_images from './en/images.json'
import en_customers from './en/customers.json'
import en_users from './en/users.json'

// Swedish
import sv_common from './sv/common.json'
import sv_navbar from './sv/navbar.json'
import sv_home from './sv/home.json'
import sv_news from './sv/news.json'
import sv_articles from './sv/articles.json'
import sv_images from './sv/images.json'
import sv_customers from './sv/customers.json'
import sv_users from './sv/users.json'

// Russian
import ru_common from './ru/common.json'
import ru_navbar from './ru/navbar.json'
import ru_home from './ru/home.json'
import ru_news from './ru/news.json'
import ru_articles from './ru/articles.json'
import ru_images from './ru/images.json'
import ru_customers from './ru/customers.json'
import ru_users from './ru/users.json'

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
