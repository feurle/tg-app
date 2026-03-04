import { api } from './api'
import type { ArticleResponse } from '../types/article'

export interface CreateArticleData {
  title: string
  content: string
  page: string
  language: string
  imageIds?: number[]
}

export interface UpdateArticleData {
  title: string
  content: string
  state: string
  language: string
  imageIds?: number[]
}

export const articleService = {
  async getAll(): Promise<ArticleResponse[]> {
    return api.get<ArticleResponse[]>('/webcontent/articles')
  },

  async getById(id: number): Promise<ArticleResponse> {
    return api.get<ArticleResponse>(`/webcontent/articles/${id}`)
  },

  async getPublished(pageType: string, language: string): Promise<ArticleResponse[]> {
    return api.get<ArticleResponse[]>(`/webcontent/articles/page/${pageType}/published`, {
      language,
    })
  },

  async create(data: CreateArticleData): Promise<ArticleResponse> {
    return api.post<ArticleResponse>('/webcontent/articles', data)
  },

  async update(id: number, data: UpdateArticleData): Promise<ArticleResponse> {
    return api.put<ArticleResponse>(`/webcontent/articles/${id}`, data)
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/webcontent/articles/${id}`)
  },
}
