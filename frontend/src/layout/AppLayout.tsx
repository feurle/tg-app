import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LanguageSync from '../i18n/LanguageSync';
import { usePageTitle } from './usePageTitle';

export default function AppLayout() {
  usePageTitle('nav.administration');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LanguageSync />
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
