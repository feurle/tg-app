import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { User, CreateUserData, UpdateUserData } from '../../types/user'
import { useUsers } from '../../hooks/useUsers.ts'
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
  const { users, loading, error, create, update, remove } = useUsers()
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave(data: CreateUserData | UpdateUserData) {
    setSaving(true)
    try {
      if (modal?.mode === 'edit' && modal?.user) {
        await update(modal.user.id, data as UpdateUserData)
      } else {
        await create(data as CreateUserData)
      }
      setModal(null)
    } catch {
      // Error already handled in hook
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await remove(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // Error already handled in hook
    } finally {
      setSaving(false)
    }
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
