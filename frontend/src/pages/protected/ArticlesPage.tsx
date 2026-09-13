import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { articleApi, imageApi, pageApi, sectionApi, tagApi } from '../../features/webcontent/api';
import type {
  ArticleResponse,
  PageResponse,
  CreateArticleRequest,
  CreateSectionRequest,
  ImageResponse,
  Language,
  MoveDirection,
  SectionResponse,
  TagResponse,
  UpdateArticleRequest,
  UpdateSectionRequest,
} from '../../features/webcontent/types';
import { LANGUAGE_MAP } from '../../features/webcontent/language';
import ArticleTable from '../../features/webcontent/components/ArticleTable';
import ArticleFormModal from '../../features/webcontent/components/ArticleFormModal';
import ArticleDetailModal from '../../features/webcontent/components/ArticleDetailModal';
import SectionFormModal from '../../features/webcontent/components/SectionFormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ApiError } from '../../lib/apiClient';

const LANGUAGES = Object.entries(LANGUAGE_MAP) as [string, Language][];

const FLAG: Record<string, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  sv: '🇸🇪',
  ru: '🇷🇺',
};

type Modal =
  | { kind: 'create' }
  | { kind: 'view'; article: ArticleResponse }
  | { kind: 'edit'; article: ArticleResponse }
  | { kind: 'delete'; article: ArticleResponse }
  | { kind: 'addSection'; article: ArticleResponse }
  | { kind: 'editSection'; article: ArticleResponse; section: SectionResponse }
  | { kind: 'deleteSection'; article: ArticleResponse; section: SectionResponse }
  | null;

interface Props {
  slug: 'home' | 'news' | 'about' | 'privacy' | 'imprint' | 'contact';
}

export default function ArticlesPage({ slug }: Readonly<Props>) {
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [page, setPage] = useState<PageResponse>();
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [languageFilter, setLanguageFilter] = useState<Language | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const [pageData, imageData, tagData] = await Promise.all([
          pageApi.getBySlug(slug),
          imageApi.getAll(),
          tagApi.getAll(),
        ]);
        setPage(pageData);
        setArticles(pageData.articles);
        setImages(imageData);
        setTags(tagData);
      } catch {
        setError(t('article.loadError'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t, slug]);

  async function handleCreate(data: CreateArticleRequest) {
    setSaving(true);
    try {
      const created = await articleApi.create(data);
      setArticles((prev) => [...prev, created]);
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: UpdateArticleRequest) {
    if (modal?.kind !== 'edit') return;
    setSaving(true);
    try {
      const updated = await articleApi.update(modal.article.id, data);
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSection(data: CreateSectionRequest) {
    if (modal?.kind !== 'addSection') return;
    setSaving(true);
    try {
      const created = await sectionApi.create(modal.article.id, data);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === modal.article.id
            ? { ...a, sections: [...a.sections, created] }
            : a,
        ),
      );
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSection(data: UpdateSectionRequest) {
    if (modal?.kind !== 'editSection') return;
    setSaving(true);
    try {
      const updated = await sectionApi.update(modal.section.id, data);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === modal.article.id
            ? { ...a, sections: a.sections.map((s) => (s.id === updated.id ? updated : s)) }
            : a,
        ),
      );
      setModal(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSection() {
    if (modal?.kind !== 'deleteSection') return;
    setSaving(true);
    try {
      await sectionApi.delete(modal.section.id);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === modal.article.id
            ? { ...a, sections: a.sections.filter((s) => s.id !== modal.section.id) }
            : a,
        ),
      );
      setModal(null);
    } catch {
      setError(t('common.deleteError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(article: ArticleResponse, direction: MoveDirection) {
    setMoving(true);
    try {
      // The response is the article's whole page + language group, already reordered.
      const reordered = await articleApi.move(article.id, direction);
      const byId = new Map(reordered.map((a) => [a.id, a]));
      setArticles((prev) => prev.map((a) => byId.get(a.id) ?? a));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.saveError');
      setError(message);
    } finally {
      setMoving(false);
    }
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    setSaving(true);
    try {
      await articleApi.delete(modal.article.id);
      setArticles((prev) => prev.filter((a) => a.id !== modal.article.id));
      setModal(null);
    } catch {
      setError(t('common.deleteError'));
    } finally {
      setSaving(false);
    }
  }

  if (!page) {
    return (
      <>
        {loading && <p style={{ marginLeft: '32px' }}>{t('common.loading')}</p>}
        {error && (
          <p style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: '32px', marginRight: '32px' }}>
            {error}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-title">{page.title}</div>
            <div className="page-subtitle">{page.description}</div>
            <div className="page-url">{page.slug}</div>
          </div>

          <div className="language-filter">
            <button
              className={`lang-btn${languageFilter === null ? ' lang-btn--active' : ''}`}
              onClick={() => setLanguageFilter(null)}
              title={t('common.all')}
            >
              🌐
            </button>
            {LANGUAGES.map(([locale, lang]) => (
              <button
                key={lang}
                className={`lang-btn${languageFilter === lang ? ' lang-btn--active' : ''}`}
                onClick={() => setLanguageFilter(lang)}
                title={t(`article.language.${lang}`, lang)}
              >
                {FLAG[locale]}
              </button>
            ))}
          </div>
          <button onClick={() => setModal({ kind: 'create' })} className="btn-accent">
            + {t('article.new')}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: '32px', marginRight: '32px' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ marginLeft: '32px' }}>{t('common.loading')}</p>
      ) : (
        <ArticleTable
          articles={articles
            .filter((a) => !languageFilter || a.language === languageFilter)}
          onView={(a) => setModal({ kind: 'view', article: a })}
          onEdit={(a) => setModal({ kind: 'edit', article: a })}
          onDelete={(a) => setModal({ kind: 'delete', article: a })}
          onAddSection={(a) => setModal({ kind: 'addSection', article: a })}
          onEditSection={(a, s) => setModal({ kind: 'editSection', article: a, section: s })}
          onDeleteSection={(a, s) => setModal({ kind: 'deleteSection', article: a, section: s })}
          onMove={handleMove}
          moving={moving}
        />
      )}

      {modal?.kind === 'view' && (
        <ArticleDetailModal article={modal.article} onClose={() => setModal(null)} />
      )}

      {modal?.kind === 'create' && (
        <ArticleFormModal
          mode="create"
          images={images}
          tags={tags}
          onSave={handleCreate}
          onCancel={() => setModal(null)}
          saving={saving}
          pageId={page?.id}
        />
      )}

      {modal?.kind === 'edit' && (
        <ArticleFormModal
          mode="edit"
          initial={modal.article}
          images={images}
          tags={tags}
          onSave={handleUpdate}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'addSection' && (
        <SectionFormModal
          mode="create"
          articleTitle={modal.article.title}
          onSave={handleAddSection}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'editSection' && (
        <SectionFormModal
          mode="edit"
          initial={modal.section}
          onSave={handleEditSection}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {modal?.kind === 'deleteSection' && (
        <ConfirmDialog
          message={t('section.deleteConfirm', { title: modal.section.title })}
          onConfirm={handleDeleteSection}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          message={t('article.deleteConfirm', { title: modal.article.title })}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
