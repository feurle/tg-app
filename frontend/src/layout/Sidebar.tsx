import {useEffect, useState} from 'react';
import {NavLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ROUTES, adminPagePath} from '../router/routes';
import {pageApi} from '../features/webcontent/api';
import type {PageSummary} from '../features/webcontent/types';
import {useAuth} from '../features/auth/authStore';

/** Order and icon of the known pages; pages not listed come last, ordered by id, with a generic icon. */
const PAGE_ORDER = ['home', 'treatments', 'for-vets', 'news', 'about', 'privacy', 'imprint'];
const PAGE_ICONS: Record<string, string> = {
    home: '🏠',
    treatments: '🩺',
    'for-vets': '🤝',
    news: '📰',
    about: '🐾',
    privacy: '🔒',
    imprint: '📄',
};

function sortPages(pages: PageSummary[]): PageSummary[] {
    const rank = (slug: string) => {
        const index = PAGE_ORDER.indexOf(slug);
        return index === -1 ? PAGE_ORDER.length : index;
    };
    return [...pages].sort((a, b) => rank(a.slug) - rank(b.slug) || a.id - b.id);
}

export default function Sidebar() {
    const {t} = useTranslation();
    const {user} = useAuth();
    const [pages, setPages] = useState<PageSummary[]>([]);

    useEffect(() => {
        pageApi.getAll().then((data) => setPages(sortPages(data))).catch(() => setPages([]));
    }, []);

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
            {pages.map((page) => (
                <NavLink
                    key={page.slug}
                    to={adminPagePath(page.slug)}
                    className={({isActive}) => isActive ? 'sidebar-item active' : 'sidebar-item'}
                >
                    <span className="sidebar-icon">{PAGE_ICONS[page.slug] ?? '📄'}</span>
                    {page.title}
                </NavLink>
            ))}

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
