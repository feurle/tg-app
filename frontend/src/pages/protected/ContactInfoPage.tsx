import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../../features/contact/api';
import type { ContactInfoResponse, ContactInfoFormData } from '../../features/contact/types';
import ContactInfoTable from '../../features/contact/components/ContactInfoTable';
import ContactInfoFormModal from '../../features/contact/components/ContactInfoFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; item: ContactInfoResponse }
  | { kind: 'delete'; item: ContactInfoResponse }
  | null;

export default function ContactInfoPage() {
  const [items, setItems] = useState<ContactInfoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await contactApi.getAll();
        setItems(data);
      } catch {
        setError(t('contactInfoAdmin.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  async function handleSave(data: ContactInfoFormData) {
    setSaving(true);
    try {
      if (modal?.kind === 'edit') {
        const updated = await contactApi.update(modal.item.id, data);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await contactApi.create(data);
        setItems((prev) => [...prev, created]);
      }
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
      await contactApi.delete(modal.item.id);
      setItems((prev) => prev.filter((i) => i.id !== modal.item.id));
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
            <div className="page-title">{t('contactInfoAdmin.management')}</div>
            <div className="page-subtitle">{t('contactInfoAdmin.subtitle')}</div>
          </div>
          <button onClick={() => setModal({ kind: 'create' })} className="btn-accent">
            + {t('contactInfoAdmin.new')}
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
        <ContactInfoTable
          items={items}
          onEdit={(item) => setModal({ kind: 'edit', item })}
          onDelete={(item) => setModal({ kind: 'delete', item })}
        />
      )}

      {(modal?.kind === 'create' || modal?.kind === 'edit') && (
        <ContactInfoFormModal
          initial={modal.kind === 'edit' ? modal.item : null}
          primaryTaken={items.some((i) =>
            i.primary && (modal.kind === 'create' || i.id !== modal.item.id)
          )}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('contactInfoAdmin.deleteConfirm', { city: modal.item.city })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
