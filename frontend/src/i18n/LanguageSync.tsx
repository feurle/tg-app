import { useEffect } from 'react';
import i18n from './index';

export default function LanguageSync() {
  useEffect(() => {
    const lang = localStorage.getItem('lang') ?? 'de';
    i18n.changeLanguage(lang);
  }, []);

  return null;
}
