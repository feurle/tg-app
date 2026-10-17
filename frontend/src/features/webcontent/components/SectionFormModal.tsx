import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../../../components/RichTextEditor';
import { imageApi } from '../api';
import type { CreateSectionRequest, ImageResponse, SectionResponse, UpdateSectionRequest } from '../types';

interface CreateProps {
  mode: 'create';
  articleTitle: string;
  nextOrder: number;
  images: ImageResponse[];
  onSave: (data: CreateSectionRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

interface EditProps {
  mode: 'edit';
  initial: SectionResponse;
  images: ImageResponse[];
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
  const [imageId, setImageId] = useState<number | null>(initial?.image?.id ?? null);
  const { images } = props;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSave({ order, title, content, imageId });
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

          {images.length > 0 && (
            <fieldset className="form-fieldset">
              <legend>{t('section.form.image')}</legend>
              <div className="image-picker">
                <button
                  type="button"
                  className={imageId === null ? 'image-picker-item selected' : 'image-picker-item'}
                  onClick={() => setImageId(null)}
                >
                  <span className="image-picker-none">{t('section.form.noImage')}</span>
                </button>
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    className={imageId === img.id ? 'image-picker-item selected' : 'image-picker-item'}
                    onClick={() => setImageId(img.id)}
                    title={img.title || img.fileName}
                  >
                    <img src={imageApi.getDownloadUrl(img.id)} alt={img.title || img.fileName} loading="lazy" />
                  </button>
                ))}
              </div>
            </fieldset>
          )}

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
