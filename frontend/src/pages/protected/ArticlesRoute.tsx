import { useParams } from 'react-router-dom';
import ArticlesPage from './ArticlesPage';

/** `/webcontent/page/:slug`. Keyed by slug so switching pages starts with a clean state. */
export default function ArticlesRoute() {
  const { slug } = useParams();
  return slug ? <ArticlesPage key={slug} slug={slug} /> : null;
}
