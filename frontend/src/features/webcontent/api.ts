import apiClient, { ApiError } from '../../lib/apiClient';
import type {
  ArticleResponse,
  CreateArticleRequest,
  CreateSectionRequest,
  CreateTagRequest,
  ImageResponse,
  Language,
  MoveDirection,
  PageResponse,
  ArticleType,
  SectionResponse,
  TagResponse,
  UpdateArticleRequest,
  UpdateImageRequest,
  UpdateSectionRequest,
  UpdateTagRequest,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const ARTICLES = '/api/webcontent/articles';
const IMAGES = '/api/webcontent/images';
const TAGS = '/api/webcontent/tags';
const PAGES = '/api/webcontent/pages';

export const articleApi = {
  getAll: () => apiClient.get<ArticleResponse[]>(ARTICLES),

  getByPage: (slug: string) =>
      apiClient.get<ArticleResponse[]>(`${ARTICLES}/page/${slug}`),

  getPublishedByPage: (slug: string, language?: Language) => {
    const url = language
      ? `${ARTICLES}/page/${slug}/published?language=${language}`
      : `${ARTICLES}/page/${slug}/published`;
    return apiClient.get<ArticleResponse[]>(url);
  },

  getByPageType: (pageType: ArticleType) =>
    apiClient.get<ArticleResponse[]>(`${ARTICLES}/pagetype/${pageType}`),

  getPublishedByPageType: (pageType: ArticleType, language?: Language) => {
    const url = language
      ? `${ARTICLES}/pagetype/${pageType}/published?language=${language}`
      : `${ARTICLES}/pagetype/${pageType}/published`;
    return apiClient.get<ArticleResponse[]>(url);
  },

  getById: (id: number) => apiClient.get<ArticleResponse>(`${ARTICLES}/${id}`),

  create: (data: CreateArticleRequest) =>
    apiClient.post<ArticleResponse>(ARTICLES, data),

  update: (id: number, data: UpdateArticleRequest) =>
    apiClient.put<ArticleResponse>(`${ARTICLES}/${id}`, data),

  /** Swaps the article with its neighbour; returns its whole page + language group, reordered. */
  move: (id: number, direction: MoveDirection) =>
    apiClient.put<ArticleResponse[]>(`${ARTICLES}/${id}/move`, { direction }),

  delete: (id: number) => apiClient.delete<void>(`${ARTICLES}/${id}`),
};

export const imageApi = {
  getAll: () => apiClient.get<ImageResponse[]>(IMAGES),

  getDownloadUrl: (id: number) => `${BASE_URL}${IMAGES}/${id}/download`,

  upload: async (file: File, title?: string): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const response = await fetch(`${BASE_URL}${IMAGES}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new ApiError(response.status, message);
    }

    return response.json() as Promise<ImageResponse>;
  },

  update: (id: number, data: UpdateImageRequest) =>
    apiClient.put<ImageResponse>(`${IMAGES}/${id}`, data),

  delete: (id: number) => apiClient.delete<void>(`${IMAGES}/${id}`),
};

export const tagApi = {
  getAll: () => apiClient.get<TagResponse[]>(TAGS),

  create: (data: CreateTagRequest) =>
    apiClient.post<TagResponse>(TAGS, data),

  update: (id: number, data: UpdateTagRequest) =>
    apiClient.put<TagResponse>(`${TAGS}/${id}`, data),

  delete: (id: number) => apiClient.delete<void>(`${TAGS}/${id}`),
};

export const pageApi = {
  getBySlug: (slug: string) => apiClient.get<PageResponse>(`${PAGES}/${slug}`),
};

const SECTIONS = '/api/webcontent/sections';

export const sectionApi = {
  create: (articleId: number, data: CreateSectionRequest) =>
    apiClient.post<SectionResponse>(`${ARTICLES}/${articleId}/sections`, data),

  update: (sectionId: number, data: UpdateSectionRequest) =>
    apiClient.put<SectionResponse>(`${SECTIONS}/${sectionId}`, data),

  delete: (sectionId: number) =>
    apiClient.delete<void>(`${SECTIONS}/${sectionId}`),
};
