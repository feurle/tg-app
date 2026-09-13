import DOMPurify from 'dompurify';
import type {ArticleResponse} from '../types';
import {imageApi} from '../api';
import {splitContent} from '../utils';

interface Props {
    article: ArticleResponse;
}

export default function ArticleBlock({article}: Props) {
    const {images, content} = article;
    const segments = splitContent(content ?? '', images.length);

    return (
        <div className="section">
          <div className="article-grid-1">
            <div className="article-block">
                {article.tags.length > 0 && (
                    <div className="article-card-tags">
                        {article.tags.map((tag) => (
                            <span key={tag.id} className="badge badge-green">{tag.name}</span>
                        ))}
                    </div>
                )}
                <h2 className="article-title">{article.title}</h2>

                {images.length === 0 && content && (
                    <div
                        className="article-content article-block-content"
                        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(content)}}
                    />
                )}

                {images.map((image, index) => {
                    const floatLeft = index % 2 === 0;
                    return (
                        <div key={image.id} style={{overflow: 'hidden', marginBottom: 16}}>
                            <img
                                src={imageApi.getDownloadUrl(image.id)}
                                alt={image.fileName}
                                title={image.fileName}
                                style={{
                                    float: floatLeft ? 'left' : 'right',
                                    width: '40%',
                                    height: 'auto',
                                    borderRadius: 8,
                                    marginRight: floatLeft ? 16 : 0,
                                    marginLeft: floatLeft ? 0 : 16,
                                    marginBottom: 8,
                                }}
                            />
                            {segments[index] && (
                                <div
                                    className="article-content article-block-content"
                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(segments[index])}}
                                />
                            )}
                        </div>
                    );
                })}

                {[...article.sections]
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                        <div key={section.id} className="article-section">
                            {section.title && <h3 className="article-section-title">{section.title}</h3>}
                            {section.content && (
                                <div
                                    className="article-content article-block-content"
                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(section.content)}}
                                />
                            )}
                        </div>
                    ))}
            </div>
        </div>
        </div>
    );
}
