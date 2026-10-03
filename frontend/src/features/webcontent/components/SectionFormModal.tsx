import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../../../components/RichTextEditor';
import type { CreateSectionRequest, SectionResponse, UpdateSectionRequest } from '../types';

interface CreateProps {
  mode: 'create';
  articleTitle: string;
  nextOrder: number;
  onSave: (data: CreateSectionRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

interface EditProps {
  mode: 'edit';
  initial: SectionResponse;
  onSave: (data: UpdateSectionRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

type Props = CreateProps | EditProps;

export default function SectionFormModal(props: Props) {
  const { mode, onCancel, saving } = props;
  const initial = mode === 'edit' ? props.initial : null;
  const { t } = useTranslation();

  // Position is changed with the arrows in the article table, not in this form.
  const order = props.mode === 'edit' ? props.initial.order : props.nextOrder;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSave({ order, title, content });
  }

  const heading = mode === 'create'
    ? `${t('section.addHeading')}: ${props.articleTitle}`
    : t('section.editHeading');

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.25rem' }}>{heading}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label className="form-label">
            {t('section.form.title')}
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            {t('section.form.content')}
            <RichTextEditor value={content} onChange={setContent} />
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
