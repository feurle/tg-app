import { useTranslation } from 'react-i18next';
import type { User } from '../types';

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({ users, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  if (users.length === 0) {
    return (
      <div style={{ margin: '0 32px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('user.empty')}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>{t('user.col.login')}</th>
            <th>{t('user.col.name')}</th>
            <th>{t('user.col.email')}</th>
            <th>{t('user.col.roles')}</th>
            <th>{t('user.col.active')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ fontWeight: 500 }}><code>{u.login}</code></td>
              <td className="td-secondary">{[u.firstName, u.lastName].filter(Boolean).join(' ') || t('common.empty')}</td>
              <td className="td-secondary">{u.email}</td>
              <td className="td-secondary">{u.authorities.length > 0 ? u.authorities.join(', ') : t('common.empty')}</td>
              <td className="td-secondary">
                <span style={{ color: u.activated ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {u.activated ? t('user.active.yes') : t('user.active.no')}
                </span>
              </td>
              <td>
                <div className="row-actions">
                  <button onClick={() => onEdit(u)} className="icon-btn" title={t('common.edit')}>
                    ✏️
                  </button>
                  <button onClick={() => onDelete(u)} className="icon-btn danger" title={t('common.delete')}>
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
