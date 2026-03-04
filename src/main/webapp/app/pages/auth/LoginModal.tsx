import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../../context/AuthContext.tsx'
import './LoginModal.css'

interface Props {
  onCancel: () => void
}

export default function LoginModal({ onCancel }: Props) {
  const { t } = useTranslation('login')
  const { login: authLogin } = useAuthContext()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authLogin(login, password)
      onCancel()
    } catch {
      setError(t('invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{t('title')}</h2>
          <button className="modal__close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal__body">
          <form className="login-modal__form" onSubmit={handleSubmit}>
            {error && <div className="login-modal__error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login" className="form-label">
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
              <label htmlFor="password" className="form-label">
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

            <div className="modal__actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
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
    </div>
  )
}
