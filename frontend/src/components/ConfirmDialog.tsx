import { useTranslation } from 'react-i18next';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <p style={{ marginBottom: '24px', fontSize: '15px', color: 'var(--text-secondary)' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-secondary">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="btn-danger">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
