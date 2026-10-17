import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublishedArticles } from '../usePublishedArticles';
import PageBlocks from './PageBlocks';
import PageSkeleton from '../../../components/PageSkeleton';

interface Props {
    slug: string;
    /** Rendered after the articles, once they are loaded. */
    children?: ReactNode;
}

/** The published content of a CMS page: loading state, "not translated yet" hint and the article blocks. */
export default function PageContent({ slug, children }: Props) {
    const { t } = useTranslation();
    const { articles, loading, fallback } = usePublishedArticles(slug);

    if (loading) return <PageSkeleton />;

    return (
        <>
            {fallback && <p className="language-fallback">{t('pages.fallbackNotice')}</p>}
            <PageBlocks articles={articles} />
            {children}
        </>
    );
}
