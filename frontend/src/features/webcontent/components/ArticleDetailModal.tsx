import { useEffect } from 'react';
import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { imageApi } from '../api';
import { splitContent } from '../utils';

interface Props {
    article: ArticleResponse;
    onClose: () => void;
}

export default function ArticleDetailModal({ article, onClose }: Props) {
    const { images, content } = article;
    const segments = splitContent(content ?? '', images.length);

    const dateStr = article.publishedDate
        ? new Date(article.publishedDate).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="news-detail-overlay" onClick={onClose}>
            <div className="news-detail-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="news-detail-handle">
                    <div className="news-detail-handle-bar" />
                </div>

                <div className="news-detail-inner">
                    <div className="news-detail-header">
                        <div className="news-detail-header-left">
                            {article.tags.length > 0 && (
                                <div className="news-detail-tags">
                                    {article.tags.map((tag) => (
                                        <span key={tag.id} className="news-row-tag">{tag.name}</span>
                                    ))}
                                </div>
                            )}
                            <h2 className="news-detail-title">{article.title}</h2>
                        </div>
                        <button className="news-detail-close" onClick={onClose} aria-label="Schließen">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="1" y1="1" x2="11" y2="11" />
                                <line x1="11" y1="1" x2="1" y2="11" />
                            </svg>
                        </button>
                    </div>

                    {dateStr && <div className="news-detail-date">{dateStr}</div>}

                    <div className="news-detail-body article-content">
                        {images.length === 0 && content && (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
                        )}

                        {images.map((image, index) => {
                            const floatLeft = index % 2 === 0;
                            return (
                                <div key={image.id} style={{ overflow: 'hidden', marginBottom: 24 }}>
                                    <img
                                        src={imageApi.getDownloadUrl(image.id)}
                                        alt={image.title || image.fileName}
                                        style={{
                                            float: floatLeft ? 'left' : 'right',
                                            width: '42%',
                                            height: 'auto',
                                            borderRadius: 10,
                                            marginRight: floatLeft ? 20 : 0,
                                            marginLeft: floatLeft ? 0 : 20,
                                            marginBottom: 8,
                                        }}
                                    />
                                    {segments[index] && (
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(segments[index]) }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {[...article.sections]
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                            <div key={section.id} className="news-detail-section">
                                {section.title && (
                                    <h3 className="news-detail-section-title">{section.title}</h3>
                                )}
                                {section.content && (
                                    <div
                                        className="news-detail-body article-content"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                                    />
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
