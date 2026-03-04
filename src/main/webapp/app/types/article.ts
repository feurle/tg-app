import type { ImageResponse } from './image'

export type { ImageResponse }

export type ArticleState = 'CREATED' | 'PUBLISHED' | 'CLOSED'
export type PageType = 'HOME_TEASER' | 'HOME_PAGE' | 'NEWS_TEASER' | 'NEWS_PAGE'
export type Language = 'GERMAN' | 'ENGLISH' | 'SWEDISH' | 'RUSSIAN'

export interface ArticleResponse {
  id: number
  title: string
  content: string
  state: ArticleState
  page: PageType
  language: Language
  publishedDate: string | null
  images: ImageResponse[]
  createdAt: string
  updatedAt: string
}