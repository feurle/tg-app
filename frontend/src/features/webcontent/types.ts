export type ArticleState = 'CREATED' | 'PUBLISHED' | 'CLOSED';
export type ArticleType = 'DEFAULT' | 'HERO' | 'COL2' | 'COL3' | 'COL4' | 'TEXT' | 'NEWS_TEASER' | 'NEWS_PAGE' | 'ABOUT_TEASER' | 'ABOUT_PAGE';
export type Language = 'GERMAN' | 'ENGLISH' | 'SWEDISH' | 'RUSSIAN';

export interface ImageResponse {
  id: number;
  fileName: string;
  title: string;
  mimeType: string;
  createdAt: string;
}

export interface TagResponse {
  id: number;
  name: string;
}

export interface SectionResponse {
  id: number;
  order: number;
  title: string;
  content: string;
}

export interface ArticleResponse {
  id: number;
  order: number;
  title: string;
  content: string;
  sections: SectionResponse[];
  state: ArticleState;
  articleType: ArticleType;
  language: Language;
  publishedDate: string | null;
  images: ImageResponse[];
  tags: TagResponse[];
  createdAt: string;
  updatedAt: string;
  pageId: string;
}

export type MoveDirection = 'UP' | 'DOWN';

export interface MoveArticleRequest {
  direction: MoveDirection;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  articleType: ArticleType;
  language: Language;
  imageIds: number[];
  tagIds: number[];
  pageId?: number;
  /** Omit to append the article at the end of its page + language. */
  order?: number;
}

export interface UpdateArticleRequest {
  title: string;
  content: string;
  state: ArticleState;
  language: Language;
  imageIds: number[];
  tagIds: number[];
  /** Omit to keep the current order. */
  order?: number;
}

export interface UpdateImageRequest {
  title: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name: string;
}

export interface CreateSectionRequest {
  order: number;
  title: string;
  content: string;
}

export interface UpdateSectionRequest {
  order: number;
  title: string;
  content: string;
}

export interface PageResponse {
  id: number;
  slug: string;
  title: string;
  description: string;
  articles: ArticleResponse[];
}
