import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Customer } from '../../types/customer'
import type { CreateCustomerData, UpdateCustomerData } from '../../types/customer'
import CustomerList from '../../components/customer/CustomerList'
import CustomerFormModal from '../../components/customer/CustomerFormModal'
import ConfirmDialog from '../../components/common/ConfirmDialog.tsx'
import './CustomerPage.css'

type ModalState = null | { mode: 'create' } | { mode: 'edit'; customer: Customer }

interface Props {
  onBack: () => void
}

export default function CustomerPage({ onBack }: Props) {
  const { t } = useTranslation(['customers', 'common'])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)

  function fetchCustomers() {
    return fetch('/api/customer')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Customer[]>
      })
      .then(setCustomers)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(() => {
    fetchCustomers().finally(() => setLoading(false))
  }, [])

  function handleSave(data: CreateCustomerData | UpdateCustomerData) {
    setSaving(true)
    const isEdit = modal?.mode === 'edit' && modal?.customer
    const url = isEdit ? `/api/customer/${(modal as { mode: 'edit'; customer: Customer }).customer.id}` : '/api/customer'
    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Customer>
      })
      .then(() => {
        setModal(null)
        return fetchCustomers()
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false))
  }

  function handleDelete(customer: Customer) {
    setDeleteTarget(customer)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return

    setSaving(true)
    fetch(`/api/customer/${deleteTarget.id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setDeleteTarget(null)
        return fetchCustomers()
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false))
  }

  return (
    <div className="customer-page">
      {/* Header */}
      <div className="customer-page-header">
        <div className="customer-page-header-content">
          <h1 className="customer-page-title">{t('pageTitle')}</h1>
          <p className="customer-page-subtitle">{t('pageSubtitle')}</p>

          <div className="customer-page-actions">
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
      <div className="customer-page-content">
        {loading && <div className="customer-page-loading">{t('common:loading')}</div>}

        {error && (
          <div className="customer-page-error">
            <strong>{t('common:error')}:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <CustomerList
            customers={customers}
            onEdit={(customer) => setModal({ mode: 'edit', customer })}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      {modal && (
        <CustomerFormModal
          initial={modal.mode === 'edit' ? modal.customer : null}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={t('deleteConfirm', { name: `${deleteTarget.firstName} ${deleteTarget.lastName}` })}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
