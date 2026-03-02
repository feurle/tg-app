export type ArticleState = 'CREATED' | 'PUBLISHED' | 'CLOSED'
export type PageType = 'HOME_TEASER' | 'HOME_PAGE' | 'NEWS_TEASER' | 'NEWS_PAGE'
export type Language = 'GERMAN' | 'ENGLISH' | 'SWEDISH' | 'RUSSIAN'

export interface ImageResponse {
  id: number
  fileName: string
  mimeType: string
  createdAt: string
}

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