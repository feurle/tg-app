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
  if (customers.length === 0) {
    return <p className="customer-list__empty">Keine Kunden vorhanden.</p>
  }

  return (
    <table className="customer-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Telefon</th>
          <th>Ort</th>
          <th>Erstellt am</th>
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
              <button className="btn btn--sm btn--secondary" onClick={() => onEdit(customer)}>
                Bearbeiten
              </button>
              <button className="btn btn--sm btn--danger" onClick={() => onDelete(customer)}>
                Löschen
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
