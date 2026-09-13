import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArticleResponse, MoveDirection, SectionResponse } from '../types';

interface Props {
  articles: ArticleResponse[];
  onView: (article: ArticleResponse) => void;
  onEdit: (article: ArticleResponse) => void;
  onDelete: (article: ArticleResponse) => void;
  onAddSection?: (article: ArticleResponse) => void;
  onEditSection?: (article: ArticleResponse, section: SectionResponse) => void;
  onDeleteSection?: (article: ArticleResponse, section: SectionResponse) => void;
  onMove?: (article: ArticleResponse, direction: MoveDirection) => void;
  moving?: boolean;
}

export default function ArticleTable({ articles, onView, onEdit, onDelete, onAddSection, onEditSection, onDeleteSection, onMove, moving }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Articles are ordered per page + language, so sort by language first to keep each
  // language's 1..N sequence contiguous.
  const sorted = [...articles].sort(
    (a, b) => a.language.localeCompare(b.language) || a.order - b.order || a.id - b.id,
  );

  // ↑/↓ must be disabled at the edges of the language group, not of the whole table.
  const firstOfLanguage = new Map<string, number>();
  const lastOfLanguage = new Map<string, number>();
  sorted.forEach((a) => {
    if (!firstOfLanguage.has(a.language)) firstOfLanguage.set(a.language, a.id);
    lastOfLanguage.set(a.language, a.id);
  });

  if (articles.length === 0) {
    return (
      <div style={{ margin: '0 32px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('article.empty')}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>{t('article.col.order')}</th>
            <th>{t('article.col.title')}</th>
            <th>{t('article.col.pageType')}</th>
            <th>{t('article.col.language')}</th>
            <th>{t('article.col.status')}</th>
            <th>{t('article.col.published')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => (
            <Fragment key={a.id}>
              <tr className="tr-expandable" onClick={() => toggle(a.id)}>
                <td className="section-order">{a.order}</td>
                <td style={{ fontWeight: 500 }}>
                  <span className="expand-chevron">{expanded.has(a.id) ? '▾' : '▸'}</span>
                  {a.title}
                </td>
                <td className="td-secondary">{t(`article.pageType.${a.articleType}`, a.articleType)}</td>
                <td className="td-secondary">{t(`article.language.${a.language}`, a.language)}</td>
                <td className="td-secondary">{t(`article.state.${a.state}`, a.state)}</td>
                <td className="td-secondary">
                  {a.publishedDate
                    ? new Date(a.publishedDate).toLocaleDateString('de-DE')
                    : t('common.empty')}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="row-actions">
                    {onMove && (
                      <>
                        <button
                          onClick={() => onMove(a, 'UP')}
                          className="icon-btn"
                          disabled={moving || firstOfLanguage.get(a.language) === a.id}
                          title={t('article.moveUp')}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => onMove(a, 'DOWN')}
                          className="icon-btn"
                          disabled={moving || lastOfLanguage.get(a.language) === a.id}
                          title={t('article.moveDown')}
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <button onClick={() => onView(a)} className="icon-btn" title={t('common.view')}>
                      👁️
                    </button>
                    <button onClick={() => onEdit(a)} className="icon-btn" title={t('common.edit')}>
                      ✏️
                    </button>
                    {onAddSection && (
                      <button onClick={() => onAddSection(a)} className="icon-btn" title={t('section.add')}>
                        ➕
                      </button>
                    )}
                    <button onClick={() => onDelete(a)} className="icon-btn danger" title={t('common.delete')}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
              {expanded.has(a.id) && (
                <tr className="tr-sections">
                  <td colSpan={7}>
                    {a.sections.length === 0 ? (
                      <p className="sections-empty">{t('section.empty')}</p>
                    ) : (
                      <div className="section-list">
                        <div className="section-item section-list-header">
                          <span>{t('section.col.title')}</span>
                          <span>{t('section.col.content')}</span>
                          <span>{t('section.col.order')}</span>
                          <span>{t('section.col.actions')}</span>
                        </div>
                        {[...a.sections]
                          .sort((x, y) => x.order - y.order)
                          .map((s) => (
                            <div key={s.id} className="section-item">
                              <span>{s.title}</span>
                              <span className="section-preview">
                                {s.content ? s.content.replace(/<[^>]+>/g, '').slice(0, 100) : '—'}
                              </span>
                              <span className="section-order">{s.order}</span>
                              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                                {onEditSection && (
                                  <button
                                    onClick={() => onEditSection(a, s)}
                                    className="icon-btn"
                                    title={t('common.edit')}
                                  >
                                    ✏️
                                  </button>
                                )}
                                {onDeleteSection && (
                                  <button
                                    onClick={() => onDeleteSection(a, s)}
                                    className="icon-btn danger"
                                    title={t('common.delete')}
                                  >
                                    🗑
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
