import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../../../components/RichTextEditor';
import type {
  ArticleResponse,
  ArticleState,
  CreateArticleRequest,
  ImageResponse,
  Language,
  ArticleType,
  TagResponse,
  UpdateArticleRequest,
} from '../types';

interface CreateProps {
  mode: 'create';
  initial?: undefined;
  images: ImageResponse[];
  tags: TagResponse[];
  onSave: (data: CreateArticleRequest) => void;
  onCancel: () => void;
  saving: boolean;
  pageId?: number;
}

interface EditProps {
  mode: 'edit';
  initial: ArticleResponse;
  images: ImageResponse[];
  tags: TagResponse[];
  onSave: (data: UpdateArticleRequest) => void;
  onCancel: () => void;
  saving: boolean;
}

type Props = CreateProps | EditProps;

const PAGE_TYPE_VALUES: ArticleType[] = ['DEFAULT', 'HERO', 'COL2', 'COL3', 'COL4', 'TEXT', 'NEWS_TEASER', 'NEWS_PAGE', 'ABOUT_TEASER', 'ABOUT_PAGE'];
const LANGUAGE_VALUES: Language[] = ['GERMAN', 'ENGLISH', 'SWEDISH', 'RUSSIAN'];
const STATE_VALUES: ArticleState[] = ['CREATED', 'PUBLISHED', 'CLOSED'];

export default function ArticleFormModal(props: Props) {
  const { mode, images, tags, onCancel, saving } = props;
  const initial = mode === 'edit' ? props.initial : null;
  const { t } = useTranslation();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [articleType, setArticleType] = useState<ArticleType>(initial?.articleType ?? 'DEFAULT');
  const [language, setLanguage] = useState<Language>(initial?.language ?? 'GERMAN');
  const [state, setState] = useState<ArticleState>(initial?.state ?? 'CREATED');
  // Empty means "let the backend decide": append at the end on create, keep the
  // current position on edit. Orders below 1 predate the sort-order feature and
  // would fail the server's @Min(1), so they start out empty rather than invalid.
  const [order, setOrder] = useState<number | ''>(
    initial?.order && initial.order > 0 ? initial.order : '',
  );
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(
    new Set(initial?.images.map((i) => i.id) ?? []),
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(
    new Set(initial?.tags.map((tg) => tg.id) ?? []),
  );

  function toggleImage(id: number) {
    setSelectedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleTag(id: number) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const imageIds = Array.from(selectedImageIds);
    const tagIds = Array.from(selectedTagIds);
    const orderField = order === '' ? {} : { order };
    if (mode === 'create') {
      props.onSave({ title, content, articleType, language, imageIds, tagIds, ...orderField, ...(props.pageId !== undefined && { pageId: props.pageId }) });
    } else {
      props.onSave({ title, content, state, language, imageIds, tagIds, ...orderField });
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.25rem' }}>
          {mode === 'create' ? t('article.newHeading') : t('article.editHeading')}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label className="form-label">
            {t('article.form.title')}
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            {t('article.form.content')}
            <RichTextEditor value={content} onChange={setContent} />
          </label>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label className="form-label" style={{ flex: 1 }}>
              {t('article.form.pageType')}
              <select
                className="form-input"
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as ArticleType)}
                disabled={mode === 'edit'}
              >
                {PAGE_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{t(`article.pageType.${v}`, v)}</option>
                ))}
              </select>
            </label>

            <label className="form-label" style={{ flex: 1 }}>
              {t('article.form.language')}
              <select
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                {LANGUAGE_VALUES.map((v) => (
                  <option key={v} value={v}>{t(`article.language.${v}`)}</option>
                ))}
              </select>
            </label>

            {mode === 'edit' && (
              <label className="form-label" style={{ flex: 1 }}>
                {t('article.form.status')}
                <select
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value as ArticleState)}
                >
                  {STATE_VALUES.map((v) => (
                    <option key={v} value={v}>{t(`article.state.${v}`)}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="form-label" style={{ maxWidth: 120 }}>
              {t('article.form.order')}
              <input
                className="form-input"
                type="number"
                min={1}
                value={order}
                placeholder={t('article.form.orderPlaceholder')}
                title={mode === 'create' ? t('article.form.orderHint') : undefined}
                onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
          </div>

          {images.length > 0 && (
            <fieldset className="form-fieldset">
              <legend>{t('article.form.images')}</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 150, overflowY: 'auto' }}>
                {images.map((img) => (
                  <label key={img.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedImageIds.has(img.id)}
                      onChange={() => toggleImage(img.id)}
                    />
                    {img.title || img.fileName}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {tags.length > 0 && (
            <fieldset className="form-fieldset">
              <legend>{t('article.form.tags')}</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={selectedTagIds.has(tag.id) ? 'badge badge-green' : 'badge'}
                  >
                    {tag.name}
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
