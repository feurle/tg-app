import type { ArticleResponse } from '../types.ts';
import DOMPurify from "dompurify";

interface Props {
  article: ArticleResponse;
}

export default function ServiceCard({ article }: Readonly<Props>) {
  return (
    <div className="article-card">
      <div className="article-card-title">{article.title}</div>
      <div className="article-content article-card-content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(article.content)}} />
    </div>
  );
}
