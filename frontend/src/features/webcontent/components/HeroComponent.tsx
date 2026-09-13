import DOMPurify from 'dompurify';
import type { ArticleResponse } from '../types.ts';
import { imageApi } from '../api.ts';
import ContactButton from './ContactButton.tsx';

interface Props {
    article: ArticleResponse;
}

export default function HeroComponent({ article }: Props) {
    const heroImage = article.images[0] ?? null;

    return (
        <div className={heroImage ? 'hero-split' : 'hero'}>
            <div className="hero-content">
                {article.tags.length > 0 && (
                    <div className="hero-tag">
                        <span>🌿</span>
                        {article.tags.map((tag) => (
                            <span key={tag.id}>{tag.name}</span>
                        ))}
                    </div>
                )}
                <h1
                    className="hero-title"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.title) }}
                />
                {article.content && (
                    <p
                        className="hero-sub"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                    />
                )}
                <ContactButton />
            </div>

            {heroImage && (
                <div className="hero-media">
                    <img
                        src={imageApi.getDownloadUrl(heroImage.id)}
                        alt={heroImage.title || heroImage.fileName}
                        className="hero-media-img"
                    />
                    <div className="hero-media-frame" />
                </div>
            )}
        </div>
    );
}
