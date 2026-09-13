import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tagApi } from '../../features/webcontent/api';
import type {
  CreateTagRequest,
  TagResponse,
  UpdateTagRequest,
} from '../../features/webcontent/types';
import TagTable from '../../features/webcontent/components/TagTable';
import TagFormModal from '../../features/webcontent/components/TagFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; tag: TagResponse }
  | { kind: 'delete'; tag: TagResponse }
  | null;

export default function TagsPage() {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await tagApi.getAll();
        setTags(data);
      } catch {
        setError(t('tag.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  async function handleCreate(data: CreateTagRequest) {
    setSaving(true);
    try {
      const created = await tagApi.create(data);
      setTags((prev) => [...prev, created]);
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: UpdateTagRequest) {
    if (modal?.kind !== 'edit') return;
    setSaving(true);
    try {
      const updated = await tagApi.update(modal.tag.id, data);
      setTags((prev) => prev.map((tg) => (tg.id === updated.id ? updated : tg)));
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
      await tagApi.delete(modal.tag.id);
      setTags((prev) => prev.filter((tg) => tg.id !== modal.tag.id));
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
            <div className="page-title">{t('tag.management')}</div>
            <div className="page-subtitle">{t('tag.subtitle')}</div>
          </div>
          <button onClick={() => setModal({ kind: 'create' })} className="btn-accent">
            + {t('tag.new')}
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
        <TagTable
          tags={tags}
          onEdit={(tg) => setModal({ kind: 'edit', tag: tg })}
          onDelete={(tg) => setModal({ kind: 'delete', tag: tg })}
        />
      )}

      {modal?.kind === 'create' && (
        <TagFormModal
          mode="create"
          onSave={handleCreate}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'edit' && (
        <TagFormModal
          mode="edit"
          initial={modal.tag}
          onSave={handleUpdate}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('tag.deleteConfirm', { name: modal.tag.name })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
