import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../router/routes';
import { useAuth } from '../features/auth/authStore';
import LoginModal from '../features/auth/components/LoginModal';
import ContactFormModal from '../features/contact/components/ContactFormModal';
import { useVetInfo } from '../features/contact/useVetInfo';
import { telHref } from '../features/contact/officeHours';
import logoImg from '../assets/logo.png';

const MAIN_LINKS = [
  { to: ROUTES.TREATMENTS, label: 'nav.treatments' },
  { to: ROUTES.ABOUT, label: 'nav.aboutMe' },
  { to: ROUTES.NEWS, label: 'nav.news' },
] as const;

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const { t } = useTranslation();
  const vetInfo = useVetInfo();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <NavLink to={ROUTES.HOME} className="nav-logo">
          <img src={logoImg} alt="Tier. Gesund." className="nav-logo-img" width="44" height="44" />
          <span className="nav-logo-text">
            <span className="nav-logo-name">{t('app.name')}</span>
            <span className="nav-logo-claim">{t('app.claim')}</span>
          </span>
        </NavLink>

        <div className="nav-links">
          {MAIN_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {t(label)}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to={ROUTES.CUSTOMERS} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {t('nav.administration')}
            </NavLink>
          )}
        </div>

        <div className="nav-right">
          <NavLink to={ROUTES.FOR_VETS} className={({ isActive }) => isActive ? 'nav-vets-link active' : 'nav-vets-link'}>
            {t('nav.forVets')}
          </NavLink>
          <button type="button" className="btn-primary nav-cta" onClick={() => setShowAppointment(true)}>
            {t('nav.appointment')}
          </button>
          {isAuthenticated ? (
            <button className="nav-login-link" onClick={logout}>
              {t('nav.logout')}
            </button>
          ) : (
            <button className="nav-login-link" onClick={() => setShowLogin(true)}>
              {t('nav.login')}
            </button>
          )}
          <button
            className="nav-hamburger"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="17" x2="21" y2="17"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-overlay" role="dialog" aria-modal="true" aria-label="Navigation">
          <nav className="mobile-overlay-links">
            {MAIN_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-link active' : 'mobile-overlay-link'}>
                {t(label)}
              </NavLink>
            ))}
            <NavLink to={ROUTES.FOR_VETS} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-sublink active' : 'mobile-overlay-sublink'}>
              {t('nav.forVets')}
            </NavLink>
            {isAuthenticated && (
              <NavLink to={ROUTES.CUSTOMERS} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-link active' : 'mobile-overlay-link'}>
                {t('nav.administration')}
              </NavLink>
            )}
            {isAuthenticated ? (
              <button className="mobile-overlay-sublink" onClick={() => { closeMenu(); logout(); }}>
                {t('nav.logout')}
              </button>
            ) : (
              <button className="mobile-overlay-sublink" onClick={() => { closeMenu(); setShowLogin(true); }}>
                {t('nav.login')}
              </button>
            )}
          </nav>
        </div>
      )}

      <div className="mobile-cta-bar">
        <button type="button" className="btn-primary mobile-cta-button" onClick={() => setShowAppointment(true)}>
          {t('nav.appointment')}
        </button>
        {vetInfo?.phone && (
          <a className="btn-secondary mobile-cta-call" href={telHref(vetInfo.phone)} aria-label={`${t('contactInfo.call')} ${vetInfo.phone}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
            </svg>
          </a>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showAppointment && <ContactFormModal mode="appointment" onClose={() => setShowAppointment(false)} />}
    </>
  );
}
