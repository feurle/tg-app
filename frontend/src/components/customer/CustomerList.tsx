import { useTranslation } from 'react-i18next'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { Customer } from '../../types/customer'
import './CustomerList.css'

interface Props {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function CustomerList({ customers, onEdit, onDelete }: Props) {
  const { t } = useTranslation(['customers', 'common'])

  if (customers.length === 0) {
    return <p className="customer-list__empty">{t('emptyState')}</p>
  }

  return (
    <table className="customer-list">
      <thead>
        <tr>
          <th>{t('columns.id')}</th>
          <th>{t('columns.name')}</th>
          <th>{t('columns.email')}</th>
          <th>{t('columns.phone')}</th>
          <th>{t('columns.city')}</th>
          <th>{t('columns.createdAt')}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td>{customer.id}</td>
            <td>{customer.firstName} {customer.lastName}</td>
            <td>{customer.email}</td>
            <td>{customer.phone || '—'}</td>
            <td>{customer.city || '—'}</td>
            <td>{formatDate(customer.createdAt)}</td>
            <td className="customer-list__actions">
              <button
                className="customer-list__action-btn customer-list__action-btn--edit"
                onClick={() => onEdit(customer)}
                title={t('actions.edit')}
                aria-label={t('actions.edit')}
              >
                <PencilIcon className="customer-list__action-icon" />
              </button>
              <button
                className="customer-list__action-btn customer-list__action-btn--delete"
                onClick={() => onDelete(customer)}
                title={t('common:delete')}
                aria-label={t('actions.delete')}
              >
                <TrashIcon className="customer-list__action-icon" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
