import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../features/users/api';
import type { CreateUserData, UpdateUserData, User } from '../../features/users/types';
import UserTable from '../../features/users/components/UserTable';
import UserFormModal from '../../features/users/components/UserFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; user: User }
  | { kind: 'delete'; user: User }
  | null;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await userApi.getAll();
        setUsers(data);
      } catch {
        setError(t('user.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  async function handleCreate(data: CreateUserData) {
    setSaving(true);
    try {
      const created = await userApi.create(data);
      setUsers((prev) => [...prev, created]);
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('user.createError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: UpdateUserData) {
    if (modal?.kind !== 'edit') return;
    setSaving(true);
    try {
      const updated = await userApi.update(modal.user.id, data);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    setSaving(true);
    try {
      await userApi.delete(modal.user.id);
      setUsers((prev) => prev.filter((u) => u.id !== modal.user.id));
      setModal(null);
    } catch {
      setError(t('common.deleteError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-title">{t('user.management')}</div>
            <div className="page-subtitle">{t('user.subtitle')}</div>
          </div>
          <button onClick={() => setModal({ kind: 'create' })} className="btn-accent">
            + {t('user.new')}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: '32px', marginRight: '32px' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ marginLeft: '32px' }}>{t('common.loading')}</p>
      ) : (
        <UserTable
          users={users}
          onEdit={(u) => setModal({ kind: 'edit', user: u })}
          onDelete={(u) => setModal({ kind: 'delete', user: u })}
        />
      )}

      {modal?.kind === 'create' && (
        <UserFormModal
          mode="create"
          onSave={handleCreate}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'edit' && (
        <UserFormModal
          mode="edit"
          user={modal.user}
          onSave={handleUpdate}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('user.deleteConfirm', { login: modal.user.login })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
