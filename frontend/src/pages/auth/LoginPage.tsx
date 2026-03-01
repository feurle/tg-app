import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AuthUser } from '../../types/auth'
import './LoginPage.css'

interface Props {
  onLogin: (user: AuthUser) => void
  onCancel: () => void
}

export default function LoginPage({ onLogin, onCancel }: Props) {
  const { t } = useTranslation('login')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('unauthorized')
        return res.json() as Promise<AuthUser>
      })
      .then((user) => onLogin(user))
      .catch(() => setError(t('invalidCredentials')))
      .finally(() => setLoading(false))
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">{t('title')}</h1>
        <p className="login-subtitle">{t('subtitle')}</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login">
              {t('loginLabel')}
            </label>
            <input
              id="login"
              type="text"
              className="form-control"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <div className="login-actions">
            <button type="submit" className="btn btn--primary login-btn" disabled={loading}>
              {loading ? t('loggingIn') : t('loginButton')}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
