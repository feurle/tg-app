import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { customerApi } from '../../features/customers/api';
import type { Customer, CustomerFormData } from '../../features/customers/types';
import CustomerTable from '../../features/customers/components/CustomerTable';
import CustomerFormModal from '../../features/customers/components/CustomerFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

type Modal =
  | { kind: 'create' }
  | { kind: 'edit'; customer: Customer }
  | { kind: 'delete'; customer: Customer }
  | null;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await customerApi.getAll();
        setCustomers(data);
      } catch {
        setError(t('customer.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  async function handleSave(data: CustomerFormData) {
    setSaving(true);
    try {
      if (modal?.kind === 'edit') {
        const updated = await customerApi.update(modal.customer.id, data);
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await customerApi.create(data);
        setCustomers((prev) => [...prev, created]);
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
      await customerApi.delete(modal.customer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== modal.customer.id));
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
            <div className="page-title">{t('customer.management')}</div>
            <div className="page-subtitle">{t('customer.subtitle')}</div>
          </div>
          <button onClick={() => setModal({ kind: 'create' })} className="btn-accent">
            + {t('customer.new')}
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
        <CustomerTable
          customers={customers}
          onEdit={(c) => setModal({ kind: 'edit', customer: c })}
          onDelete={(c) => setModal({ kind: 'delete', customer: c })}
        />
      )}

      {(modal?.kind === 'create' || modal?.kind === 'edit') && (
        <CustomerFormModal
          initial={modal.kind === 'edit' ? modal.customer : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('customer.deleteConfirm', {
            firstName: modal.customer.firstName,
            lastName: modal.customer.lastName,
          })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
