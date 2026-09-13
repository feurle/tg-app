import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types';
import { imageApi } from '../api';

interface Props {
    article: ArticleResponse;
}

export default function Col2Component({ article }: Props) {
    const image = article.images[0] ?? null;
    const sorted = [...article.sections].sort((a, b) => a.order - b.order);

    return (
        <div className={`col2-block${image ? ' col2-block--with-image' : ''}`}>
            <div className="col2-content">
                {article.tags.length > 0 && (
                    <div className="col2-tags">
                        {article.tags.map(tag => (
                            <span key={tag.id} className="badge badge-green">{tag.name}</span>
                        ))}
                    </div>
                )}
                <h2 className="col2-title"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }}
                />
                {article.content && (
                    <div
                        className="article-content col2-lead"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                    />
                )}
                {sorted.map(section => (
                    <div key={section.id} className="col2-section">
                        {section.title && (
                            <h3 className="col2-section-title">{section.title}</h3>
                        )}
                        {section.content && (
                            <div
                                className="article-content col2-section-content"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                            />
                        )}
                    </div>
                ))}
            </div>
            {image && (
                <div className="col2-media">
                    <div className="col2-media-inner">
                        <img
                            src={imageApi.getDownloadUrl(image.id)}
                            alt={image.title || image.fileName}
                            className="col2-media-img"
                        />
                        <div className="col2-media-frame" />
                    </div>
                </div>
            )}
        </div>
    );
}
