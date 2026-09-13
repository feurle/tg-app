import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';
import sv from './locales/sv.json';
import ru from './locales/ru.json';

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    sv: { translation: sv },
    ru: { translation: ru },
  },
  lng: localStorage.getItem('lang') ?? 'de',
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
