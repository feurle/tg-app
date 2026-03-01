import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n/config'
import './Navbar.css'

type Page = 'home' | 'news' | 'articles' | 'images' | 'customers' | 'users'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const LANGUAGE_FLAGS: Record<string, { flag: string; name: string }> = {
  de: { flag: '🇩🇪', name: 'Deutsch' },
  en: { flag: '🇬🇧', name: 'English' },
  sv: { flag: '🇸🇪', name: 'Svenska' },
  ru: { flag: '🇷🇺', name: 'Русский' },
}

export default function Navbar({ currentPage, onNavigate }: Props) {
  const { t } = useTranslation('navbar')
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'de')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng)
    }
    i18n.on('languageChanged', handleLanguageChanged)
    return () => i18n.off('languageChanged', handleLanguageChanged)
  }, [])

  function handleLanguageChange(lng: string) {
    i18n.changeLanguage(lng)
    setIsLangMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="navbar-brand"
        >
          {t('brand')}
        </button>

        {/* Center Navigation */}
        <div className="navbar-nav">
          <button
            onClick={() => onNavigate('home')}
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => onNavigate('news')}
            className={`nav-link ${currentPage === 'news' ? 'active' : ''}`}
          >
            {t('news')}
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          <button
            onClick={() => onNavigate('articles')}
            className={`nav-link ${currentPage === 'articles' ? 'active' : ''}`}
          >
            {t('articles')}
          </button>
          <button
            onClick={() => onNavigate('customers')}
            className={`nav-link ${currentPage === 'customers' ? 'active' : ''}`}
          >
            {t('customers')}
          </button>
          <button
            onClick={() => onNavigate('users')}
            className={`nav-link ${currentPage === 'users' ? 'active' : ''}`}
          >
            {t('users')}
          </button>
          <button
            onClick={() => onNavigate('images')}
            className={`nav-link ${currentPage === 'images' ? 'active' : ''}`}
          >
            {t('images')}
          </button>
          <div className="navbar-language-selector">
            <button
              className="navbar-language-btn"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            >
              <span className="navbar-language-flag">{LANGUAGE_FLAGS[currentLang]?.flag}</span>
              <span className="navbar-language-name">{LANGUAGE_FLAGS[currentLang]?.name}</span>
            </button>
            {isLangMenuOpen && (
              <div className="navbar-language-menu">
                {Object.entries(LANGUAGE_FLAGS).map(([lng, { flag, name }]) => (
                  <button
                    key={lng}
                    className={`navbar-language-menu-item ${currentLang === lng ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lng)}
                  >
                    <span className="navbar-language-menu-flag">{flag}</span>
                    <span className="navbar-language-menu-name">{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="navbar-mobile-menu">
        <button
          onClick={() => onNavigate('home')}
          className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
        >
          {t('home')}
        </button>
        <button
          onClick={() => onNavigate('news')}
          className={`mobile-nav-link ${currentPage === 'news' ? 'active' : ''}`}
        >
          {t('news')}
        </button>
        <button
          onClick={() => onNavigate('articles')}
          className={`mobile-nav-link ${currentPage === 'articles' ? 'active' : ''}`}
        >
          {t('articles')}
        </button>
        <button
          onClick={() => onNavigate('customers')}
          className={`mobile-nav-link ${currentPage === 'customers' ? 'active' : ''}`}
        >
          {t('customers')}
        </button>
        <button
          onClick={() => onNavigate('users')}
          className={`mobile-nav-link ${currentPage === 'users' ? 'active' : ''}`}
        >
          {t('users')}
        </button>
        <button
          onClick={() => onNavigate('images')}
          className={`mobile-nav-link ${currentPage === 'images' ? 'active' : ''}`}
        >
          {t('images')}
        </button>
        <div className="mobile-language-selector">
          <span className="mobile-language-label">Sprache / Language:</span>
          <select
            value={currentLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="mobile-language-select"
          >
            {Object.entries(LANGUAGE_FLAGS).map(([lng, { flag, name }]) => (
              <option key={lng} value={lng}>
                {flag} {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  )
}
