import { useTranslation } from 'react-i18next';
import type { ContactInfoResponse } from '../types';

interface Props {
  items: ContactInfoResponse[];
  onEdit: (item: ContactInfoResponse) => void;
  onDelete: (item: ContactInfoResponse) => void;
}

export default function ContactInfoTable({ items, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div style={{ margin: '0 32px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('contactInfoAdmin.empty')}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>{t('contactInfoAdmin.col.name')}</th>
            <th>{t('contactInfoAdmin.col.phone')}</th>
            <th>{t('contactInfoAdmin.col.email')}</th>
            <th>{t('contactInfoAdmin.col.city')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ fontWeight: 500 }}>
                {item.name}
                {item.primary && (
                  <span title={t('contactInfoAdmin.primary')} style={{ marginLeft: '6px' }}>⭐</span>
                )}
              </td>
              <td className="td-secondary">{item.phone}</td>
              <td className="td-secondary">{item.email}</td>
              <td className="td-secondary">{item.zip} {item.city}</td>
              <td>
                <div className="row-actions">
                  <button onClick={() => onEdit(item)} className="icon-btn" title={t('common.edit')}>
                    ✏️
                  </button>
                  <button onClick={() => onDelete(item)} className="icon-btn danger" title={t('common.delete')}>
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
