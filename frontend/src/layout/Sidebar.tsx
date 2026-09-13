import {NavLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ROUTES} from '../router/routes';
import {useAuth} from '../features/auth/authStore';

export default function Sidebar() {
    const {t} = useTranslation();
    const {user} = useAuth();

    const getInitials = (username?: string) => {
        if (!username) return 'U';
        return username
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-section-label">{t('nav.sidebar.management')}</div>
            <NavLink
                to={ROUTES.CUSTOMERS}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">👥</span>
                {t('nav.customers')}
            </NavLink>
            <NavLink
                to={ROUTES.USERS}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">👤</span>
                {t('nav.users')}
            </NavLink>
            <NavLink
                to={ROUTES.QUESTIONNAIRES}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">📋</span>
                {t('nav.questionnaires')}
            </NavLink>
            <NavLink
                to={ROUTES.CONTACT_INFO}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">📇</span>
                {t('nav.contactInfo')}
            </NavLink>

            <div className="sidebar-section-label">{t('nav.sidebar.webcontent')}</div>
            <NavLink
                to={ROUTES.IMAGES}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">🖼️</span>
                {t('nav.images')}
            </NavLink>
            <NavLink
                to={ROUTES.TAGS}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">🏷️</span>
                {t('nav.tags')}
            </NavLink>

            <div className="sidebar-section-label">{t('nav.sidebar.pages')}</div>
            <NavLink
                to={ROUTES.PAGE_HOME}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">🏠</span>
                {t('nav.home')}
            </NavLink>
            <NavLink
                to={ROUTES.PAGE_NEWS}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">📰</span>
                {t('nav.news')}
            </NavLink>
            <NavLink
                to={ROUTES.PAGE_ABOUT}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">🐾</span>
                {t('nav.about')}
            </NavLink>
            <NavLink
                to={ROUTES.PAGE_PRIVACY}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">🔒</span>
                {t('nav.privacy')}
            </NavLink>
            <NavLink
                to={ROUTES.PAGE_IMPRINT}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">📄</span>
                {t('nav.imprint')}
            </NavLink>
            <NavLink
                to={ROUTES.PAGE_CONTACT}
                className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
            >
                <span className="sidebar-icon">✉️</span>
                {t('nav.contact')}
            </NavLink>



            <div className="sidebar-footer">
                <div className="user-chip">
                    <div className="user-avatar">{getInitials(user?.username)}</div>
                    <div>
                        <div className="user-name">{user?.username || 'User'}</div>
                        <div className="user-role">{t('nav.sidebar.admin')}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
