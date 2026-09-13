import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { imageApi } from '../../features/webcontent/api';
import type { ImageResponse, UpdateImageRequest } from '../../features/webcontent/types';
import ImageGrid from '../../features/webcontent/components/ImageGrid';
import ImageUploadModal from '../../features/webcontent/components/ImageUploadModal';
import ImageFormModal from '../../features/webcontent/components/ImageFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

type Modal =
  | { kind: 'upload' }
  | { kind: 'edit'; image: ImageResponse }
  | { kind: 'delete'; image: ImageResponse }
  | null;

export default function ImagesPage() {
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await imageApi.getAll();
        setImages(data);
      } catch {
        setError(t('image.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  async function handleUpload(file: File, title: string) {
    setSaving(true);
    try {
      const created = await imageApi.upload(file, title);
      setImages((prev) => [...prev, created]);
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('image.uploadError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: UpdateImageRequest) {
    if (modal?.kind !== 'edit') return;
    setSaving(true);
    try {
      const updated = await imageApi.update(modal.image.id, data);
      setImages((prev) => prev.map((img) => img.id === updated.id ? updated : img));
      setModal(null);
    } catch {
      setError(t('common.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    setSaving(true);
    try {
      await imageApi.delete(modal.image.id);
      setImages((prev) => prev.filter((img) => img.id !== modal.image.id));
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
            <div className="page-title">{t('image.management')}</div>
            <div className="page-subtitle">{t('image.subtitle')}</div>
          </div>
          <button onClick={() => setModal({ kind: 'upload' })} className="btn-accent">
            + {t('image.upload')}
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
        <ImageGrid
          images={images}
          onEdit={(img) => setModal({ kind: 'edit', image: img })}
          onDelete={(img) => setModal({ kind: 'delete', image: img })}
        />
      )}

      {modal?.kind === 'edit' && (
        <ImageFormModal
          image={modal.image}
          onSave={handleEdit}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'upload' && (
        <ImageUploadModal
          onUpload={handleUpload}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('image.deleteConfirm', { fileName: modal.image.fileName })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
