export type ArticleState = 'CREATED' | 'PUBLISHED' | 'CLOSED'
export type PageType = 'TEASER' | 'HOME' | 'NEWS'

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
  publishedDate: string | null
  images: ImageResponse[]
  createdAt: string
  updatedAt: string
}