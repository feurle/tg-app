import { useTranslation } from 'react-i18next';
import type { TagResponse } from '../types';

interface Props {
  tags: TagResponse[];
  onEdit: (tag: TagResponse) => void;
  onDelete: (tag: TagResponse) => void;
}

export default function TagTable({ tags, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  if (tags.length === 0) {
    return (
      <div style={{ margin: '0 32px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('tag.empty')}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>{t('tag.col.name')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td style={{ fontWeight: 500 }}>{tag.name}</td>
              <td>
                <div className="row-actions">
                  <button onClick={() => onEdit(tag)} className="icon-btn" title={t('common.edit')}>
                    ✏️
                  </button>
                  <button onClick={() => onDelete(tag)} className="icon-btn danger" title={t('common.delete')}>
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
