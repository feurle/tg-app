import { useTranslation } from 'react-i18next';
import type { Customer } from '../types';

interface Props {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export default function CustomerTable({ customers, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  if (customers.length === 0) {
    return (
      <div style={{ margin: '0 32px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('customer.empty')}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>{t('customer.col.name')}</th>
            <th>{t('customer.col.email')}</th>
            <th>{t('customer.col.phone')}</th>
            <th>{t('customer.col.city')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
              <td className="td-secondary">{c.email}</td>
              <td className="td-secondary">{c.phone ?? t('common.empty')}</td>
              <td className="td-secondary">{c.city ?? t('common.empty')}</td>
              <td>
                <div className="row-actions">
                  <button onClick={() => onEdit(c)} className="icon-btn" title={t('common.edit')}>
                    ✏️
                  </button>
                  <button onClick={() => onDelete(c)} className="icon-btn danger" title={t('common.delete')}>
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
