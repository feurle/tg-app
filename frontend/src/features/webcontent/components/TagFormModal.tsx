import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CreateTagRequest,
  TagResponse,
  UpdateTagRequest,
} from '../types';

interface CreateProps {
  mode: 'create';
  initial?: undefined;
  onSave: (data: CreateTagRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

interface EditProps {
  mode: 'edit';
  initial: TagResponse;
  onSave: (data: UpdateTagRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

type Props = CreateProps | EditProps;

export default function TagFormModal(props: Props) {
  const { mode, onCancel, saving } = props;
  const initial = mode === 'edit' ? props.initial : null;
  const { t } = useTranslation();

  const [name, setName] = useState(initial?.name ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSave({ name });
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1rem' }}>
          {mode === 'create' ? t('tag.newHeading') : t('tag.editHeading')}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={labelStyle}>
            {t('tag.name')}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-accent">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};

const modal: React.CSSProperties = {
  background: '#fff', padding: '2rem', borderRadius: '8px',
  width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
};

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', fontSize: '0.8rem', fontWeight: 500, gap: '2px',
};

const inputStyle: React.CSSProperties = {
  padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem',
};
