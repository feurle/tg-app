import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient, { ApiError } from '../../../lib/apiClient';
import { authStore } from '../authStore';

interface LoginModalProps {
  onClose: () => void;
}

interface LoginResponse {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  authorities: string[];
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiClient.post<LoginResponse>('/api/auth/login', { login: username, password });
      authStore.login({ username: data.login, roles: data.authorities });
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('auth.errorInvalid'));
      } else {
        setError(t('auth.errorGeneral'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="login-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-logo">
          <div className="nav-logo-dot" />
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
            {t('app.name')}
          </span>
        </div>
        <div className="login-title">{t('auth.loginHeading')}</div>
        <div className="login-sub">{t('auth.loginSub')}</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.username')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password"
              className="form-input"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '13px' }}>{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <div className="divider" />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          {t('auth.accessNote')}
        </div>
      </div>
    </div>
  );
}
