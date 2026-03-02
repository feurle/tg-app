import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { User, CreateUserData, UpdateUserData } from '../../types/user'
import UserList from '../../components/user/UserList'
import UserFormModal from '../../components/user/UserFormModal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import './UserPage.css'

type ModalState = null | { mode: 'create' } | { mode: 'edit'; user: User }

interface Props {
  onBack: () => void
}

export default function UserPage({ onBack }: Props) {
  const { t } = useTranslation(['users', 'common'])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  function fetchUsers() {
    return fetch('/api/user')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<User[]>
      })
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false))
  }, [])

  function handleSave(data: CreateUserData | UpdateUserData) {
    setSaving(true)
    const isEdit = modal?.mode === 'edit' && modal?.user
    const url = isEdit ? `/api/user/${(modal as { mode: 'edit'; user: User }).user.id}` : '/api/user'
    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<User>
      })
      .then(() => {
        setModal(null)
        return fetchUsers()
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false))
  }

  function handleDelete() {
    if (!deleteTarget) return

    setSaving(true)
    fetch(`/api/user/${deleteTarget.id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setDeleteTarget(null)
        return fetchUsers()
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false))
  }

  return (
    <div className="user-page">
      {/* Header */}
      <div className="user-page-header">
        <div className="user-page-header-content">
          <h1 className="user-page-title">{t('pageTitle')}</h1>
          <p className="user-page-subtitle">{t('pageSubtitle')}</p>

          <div className="user-page-actions">
            <button
              className="btn btn--primary"
              onClick={() => setModal({ mode: 'create' })}
              disabled={loading || saving}
            >
              {t('createNew')}
            </button>
            <button
              className="btn btn--secondary"
              onClick={onBack}
              disabled={loading || saving}
            >
              {t('common:back')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="user-page-content">
        {loading && <div className="user-page-loading">{t('common:loading')}</div>}

        {error && (
          <div className="user-page-error">
            <strong>{t('common:error')}:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <UserList
            users={users}
            onEdit={(user) => setModal({ mode: 'edit', user })}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      {/* Modals */}
      {modal && (
        <UserFormModal
          initial={modal.mode === 'edit' ? modal.user : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={t('deleteConfirm', { login: deleteTarget.login })}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
