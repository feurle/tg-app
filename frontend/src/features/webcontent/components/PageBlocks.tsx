import type { ArticleResponse } from '../types';
import HeroPortraitComponent from './HeroPortraitComponent';
import SymptomsComponent from './SymptomsComponent';
import MethodsComponent from './MethodsComponent';
import AboutTeaserComponent from './AboutTeaserComponent';
import StepsComponent from './StepsComponent';
import VetBandComponent from './VetBandComponent';
import HeroComponent from './HeroComponent';
import Col2Component from './Col2Component';
import Col3Component from './Col3Component';
import Col4Component from './Col4Component';
import TextBlock from './TextBlock';
import CtaComponent from './CtaComponent';

interface Props {
    articles: ArticleResponse[];
}

/** Renders the articles of a page, one component per `articleType`. Unknown types render nothing. */
export default function PageBlocks({ articles }: Props) {
    return (
        <>
            {articles.map((article) => {
                switch (article.articleType) {
                    case 'HERO_PORTRAIT': return <HeroPortraitComponent key={article.id} article={article} />;
                    case 'SYMPTOMS': return <SymptomsComponent key={article.id} article={article} />;
                    case 'METHODS': return <MethodsComponent key={article.id} article={article} />;
                    case 'ABOUT_TEASER': return <AboutTeaserComponent key={article.id} article={article} />;
                    case 'STEPS': return <StepsComponent key={article.id} article={article} />;
                    case 'VET_BAND': return <VetBandComponent key={article.id} article={article} />;
                    case 'HERO': return <HeroComponent key={article.id} article={article} />;
                    case 'COL2': return <Col2Component key={article.id} article={article} />;
                    case 'COL3': return <Col3Component key={article.id} article={article} />;
                    case 'COL4': return <Col4Component key={article.id} article={article} />;
                    case 'TEXT': return <TextBlock key={article.id} article={article} />;
                    case 'CTA': return <CtaComponent key={article.id} article={article} />;
                    default: return null;
                }
            })}
        </>
    );
}
