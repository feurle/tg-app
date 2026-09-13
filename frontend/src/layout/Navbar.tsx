import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../router/routes';
import { useAuth } from '../features/auth/authStore';
import LoginModal from '../features/auth/components/LoginModal';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [mobileRequestsOpen, setMobileRequestsOpen] = useState(false);
  const requestsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const isRequestsActive = ([ROUTES.FOR_PET_OWNERS, ROUTES.FOR_VETS] as string[]).includes(location.pathname);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    setMobileRequestsOpen(false);
  }

  useEffect(() => {
    if (!showRequests) return;
    function handleClickOutside(e: MouseEvent) {
      if (requestsRef.current && !requestsRef.current.contains(e.target as Node)) {
        setShowRequests(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRequests]);

  return (
    <>
      <nav className="navbar">
        <NavLink to={ROUTES.HOME} className="nav-logo">
          <img src={logoImg} alt="Tier Gesund" className="nav-logo-img" width="44" height="44" />
          <span className="nav-logo-text">
            <span className="nav-logo-name">{t('app.name')}</span>
            <span className="nav-logo-claim">{t('app.claim')}</span>
          </span>
        </NavLink>

        <div className="nav-links">
          <NavLink to={ROUTES.HOME} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.home')}
          </NavLink>
          <NavLink to={ROUTES.NEWS} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.news')}
          </NavLink>
          <NavLink to={ROUTES.ABOUT} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('pages.about')}
          </NavLink>
          <div className="nav-dropdown" ref={requestsRef}>
            <button
              className={isRequestsActive ? 'nav-dropdown-trigger active' : 'nav-dropdown-trigger'}
              onClick={() => setShowRequests((v) => !v)}
              aria-expanded={showRequests}
            >
              {t('nav.requests')}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                style={{ transform: showRequests ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
              >
                <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showRequests && (
              <div className="nav-dropdown-menu">
                <NavLink
                  to={ROUTES.FOR_PET_OWNERS}
                  className={({ isActive }) => isActive ? 'nav-dropdown-item active' : 'nav-dropdown-item'}
                  onClick={() => setShowRequests(false)}
                >
                  {t('nav.forPetOwners')}
                </NavLink>
                <NavLink
                  to={ROUTES.FOR_VETS}
                  className={({ isActive }) => isActive ? 'nav-dropdown-item active' : 'nav-dropdown-item'}
                  onClick={() => setShowRequests(false)}
                >
                  {t('nav.forVets')}
                </NavLink>
              </div>
            )}
          </div>
          {isAuthenticated && (
            <NavLink to={ROUTES.CUSTOMERS} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {t('nav.administration')}
            </NavLink>
          )}
        </div>

        <div className="nav-right">
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
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
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
            <NavLink to={ROUTES.HOME} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-link active' : 'mobile-overlay-link'}>
              {t('nav.home')}
            </NavLink>
            <NavLink to={ROUTES.NEWS} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-link active' : 'mobile-overlay-link'}>
              {t('nav.news')}
            </NavLink>
            <NavLink to={ROUTES.ABOUT} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-link active' : 'mobile-overlay-link'}>
              {t('pages.about')}
            </NavLink>
            <div className="mobile-overlay-group">
              <button
                className="mobile-overlay-group-trigger"
                onClick={() => setMobileRequestsOpen((v) => !v)}
                aria-expanded={mobileRequestsOpen}
              >
                {t('nav.requests')}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  style={{ transform: mobileRequestsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
                >
                  <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {mobileRequestsOpen && (
                <div className="mobile-overlay-subitems">
                  <NavLink
                    to={ROUTES.FOR_PET_OWNERS}
                    onClick={closeMenu}
                    className={({ isActive }) => isActive ? 'mobile-overlay-sublink active' : 'mobile-overlay-sublink'}
                  >
                    {t('nav.forPetOwners')}
                  </NavLink>
                  <NavLink
                    to={ROUTES.FOR_VETS}
                    onClick={closeMenu}
                    className={({ isActive }) => isActive ? 'mobile-overlay-sublink active' : 'mobile-overlay-sublink'}
                  >
                    {t('nav.forVets')}
                  </NavLink>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <NavLink to={ROUTES.CUSTOMERS} onClick={closeMenu} className={({ isActive }) => isActive ? 'mobile-overlay-link active' : 'mobile-overlay-link'}>
                {t('nav.administration')}
              </NavLink>
            )}
          </nav>
        </div>
      )}


      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
