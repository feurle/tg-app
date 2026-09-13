import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../router/routes';
import logoImg from '../assets/logo.png';
import LoginModal from '../features/auth/components/LoginModal';

const LANGUAGES = [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'sv', label: 'Svenska' },
    { code: 'ru', label: 'Русский' },
];

export default function Footer() {
    const { t, i18n: i18nInstance } = useTranslation();
    const [showLogin, setShowLogin] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const currentLang = i18nInstance.language;
    const currentLabel = LANGUAGES.find(l => l.code === currentLang)?.label ?? currentLang;

    function switchLanguage(code: string) {
        localStorage.setItem('lang', code);
        i18nInstance.changeLanguage(code);
        setShowLangMenu(false);
    }

    useEffect(() => {
        if (!showLangMenu) return;
        function handleClickOutside(e: MouseEvent) {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setShowLangMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLangMenu]);

    return (
        <>
            <footer className="footer">
                <div className="footer-brand-col">
                    <Link to={ROUTES.HOME} className="footer-brand-name">
                        <img src={logoImg} alt="" className="footer-brand-img" width="32" height="32" />
                        {t('app.name')}
                    </Link>
                    <p className="footer-tagline">{t('home.tagline')}</p>
                </div>

                <div className="footer-col">
                    <div className="footer-col-label">Navigation</div>
                    <Link className="footer-link" to={ROUTES.HOME}>{t('nav.home')}</Link>
                    <Link className="footer-link" to={ROUTES.NEWS}>{t('nav.news')}</Link>
                    <Link className="footer-link" to={ROUTES.ABOUT}>{t('pages.about')}</Link>
                </div>

                <div className="footer-col">
                    <div className="footer-col-label">Info</div>
                    <Link className="footer-link" to={ROUTES.PRIVACY}>{t('footer.privacy')}</Link>
                    <Link className="footer-link" to={ROUTES.IMPRESS}>{t('footer.imprint')}</Link>
                    <Link className="footer-link" to={ROUTES.CONTACT}>{t('footer.contact')}</Link>
                </div>

                <div className="footer-col">
                    <div className="footer-col-label">{t('footer.language')}</div>
                    <div className="footer-lang-col" ref={langRef}>
                        <button
                            className="footer-lang-trigger"
                            onClick={() => setShowLangMenu(v => !v)}
                            aria-expanded={showLangMenu}
                        >
                            {currentLabel}
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
                                style={{ transform: showLangMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
                                <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showLangMenu && (
                            <div className="footer-lang-menu">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        className={`footer-lang-item${currentLang === lang.code ? ' active' : ''}`}
                                        onClick={() => switchLanguage(lang.code)}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="footer-bottom">
                    <span className="footer-copy">© {new Date().getFullYear()} {t('app.name')}</span>
                </div>
            </footer>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </>
    );
}
