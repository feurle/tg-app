import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './LoginModal.css'

interface Props {
  onSuccess: () => void
  onClose: () => void
}

export default function LoginModal({ onSuccess, onClose }: Props) {
  const { t } = useTranslation('common')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }).toString(),
      })

      if (response.ok) {
        onSuccess()
      } else {
        setError(t('form.invalidCredentials'))
      }
    } catch (err) {
      setError(t('form.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2 className="login-modal-title">{t('form.login')}</h2>
          <button
            type="button"
            className="login-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-form-error">{error}</div>}

          <div className="login-form-group">
            <label htmlFor="username" className="login-form-label">
              {t('form.username')}
            </label>
            <input
              type="text"
              id="username"
              className="login-form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-form-label">
              {t('form.password')}
            </label>
            <input
              type="password"
              id="password"
              className="login-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="login-form-actions">
            <button
              type="submit"
              className="login-form-submit"
              disabled={loading}
            >
              {loading ? t('form.loggingIn') : t('form.login')}
            </button>
            <button
              type="button"
              className="login-form-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {t('form.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
