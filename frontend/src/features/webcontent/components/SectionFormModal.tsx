import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../../../components/RichTextEditor';
import { ROUTES } from '../../../router/routes';
import { imageApi } from '../api';
import { CONTACT_APPOINTMENT, CONTACT_MESSAGE, isValidCtaTarget } from '../ctaTarget';
import type { CreateSectionRequest, ImageResponse, SectionResponse, UpdateSectionRequest } from '../types';

interface CreateProps {
  mode: 'create';
  articleTitle: string;
  /** The section is a button of a CTA article: label + target instead of title + rich text. */
  isCta?: boolean;
  nextOrder: number;
  images: ImageResponse[];
  onSave: (data: CreateSectionRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

interface EditProps {
  mode: 'edit';
  initial: SectionResponse;
  isCta?: boolean;
  images: ImageResponse[];
  onSave: (data: UpdateSectionRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

type Props = CreateProps | EditProps;

type TargetKind = 'contact' | 'internal' | 'external';

function targetKindOf(target: string): TargetKind {
  if (target.startsWith('contact:')) return 'contact';
  if (/^https?:\/\//i.test(target)) return 'external';
  return target === '' ? 'contact' : 'internal';
}

const INTERNAL_PAGES: string[] = [ROUTES.QUESTIONNAIRE, ROUTES.CONTACT];

export default function SectionFormModal(props: Props) {
  const { mode, onCancel, saving } = props;
  const initial = mode === 'edit' ? props.initial : null;
  const { t } = useTranslation();

  // Position is changed with the arrows in the article table, not in this form.
  const order = props.mode === 'edit' ? props.initial.order : props.nextOrder;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? (props.isCta ? CONTACT_APPOINTMENT : ''));
  const [imageId, setImageId] = useState<number | null>(initial?.image?.id ?? null);
  const { images, isCta = false } = props;
  const [targetKind, setTargetKind] = useState<TargetKind>(targetKindOf(initial?.content ?? ''));
  const [targetError, setTargetError] = useState(false);

  function changeTargetKind(kind: TargetKind) {
    setTargetKind(kind);
    setTargetError(false);
    setContent(kind === 'contact' ? CONTACT_APPOINTMENT : kind === 'internal' ? INTERNAL_PAGES[0] : 'https://');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCta && !isValidCtaTarget(content)) {
      setTargetError(true);
      return;
    }
    props.onSave({ order, title, content, imageId: isCta ? null : imageId });
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
            {isCta ? t('section.cta.label') : t('section.form.title')}
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {isCta ? (
            <>
              <label className="form-label">
                {t('section.cta.targetKind')}
                <select
                  className="form-input"
                  value={targetKind}
                  onChange={(e) => changeTargetKind(e.target.value as TargetKind)}
                >
                  <option value="contact">{t('section.cta.kind.contact')}</option>
                  <option value="internal">{t('section.cta.kind.internal')}</option>
                  <option value="external">{t('section.cta.kind.external')}</option>
                </select>
              </label>
              <label className="form-label">
                {t('section.cta.target')}
                {targetKind === 'external' ? (
                  <input
                    className="form-input"
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setTargetError(false); }}
                    placeholder="https://"
                    required
                  />
                ) : (
                  <select className="form-input" value={content} onChange={(e) => setContent(e.target.value)}>
                    {targetKind === 'contact' ? (
                      <>
                        <option value={CONTACT_APPOINTMENT}>{t('section.cta.contact.appointment')}</option>
                        <option value={CONTACT_MESSAGE}>{t('section.cta.contact.message')}</option>
                      </>
                    ) : (
                      (INTERNAL_PAGES.includes(content) ? INTERNAL_PAGES : [content, ...INTERNAL_PAGES]).map((path) => <option key={path} value={path}>{path}</option>)
                    )}
                  </select>
                )}
              </label>
              {targetError && <p className="form-error" role="alert">{t('section.cta.invalidTarget')}</p>}
            </>
          ) : (
            <label className="form-label">
              {t('section.form.content')}
              <RichTextEditor value={content} onChange={setContent} />
            </label>
          )}

          {!isCta && images.length > 0 && (
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
