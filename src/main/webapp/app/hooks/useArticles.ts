import { useState, useEffect } from 'react'
import type { CreateArticleData, UpdateArticleData } from '../services/article.service'
import { articleService } from '../services/article.service'
import type { ArticleResponse } from '../types/article'

interface UseArticlesResult {
  articles: ArticleResponse[]
  loading: boolean
  error: string | null
  create: (data: CreateArticleData) => Promise<ArticleResponse>
  update: (id: number, data: UpdateArticleData) => Promise<ArticleResponse>
  remove: (id: number) => Promise<void>
  reload: () => Promise<void>
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async () => {
    try {
      setError(null)
      const data = await articleService.getAll()
      setArticles(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch articles'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const create = async (data: CreateArticleData): Promise<ArticleResponse> => {
    const result = await articleService.create(data)
    await fetchArticles()
    return result
  }

  const update = async (id: number, data: UpdateArticleData): Promise<ArticleResponse> => {
    const result = await articleService.update(id, data)
    await fetchArticles()
    return result
  }

  const remove = async (id: number): Promise<void> => {
    await articleService.remove(id)
    await fetchArticles()
  }

  return {
    articles,
    loading,
    error,
    create,
    update,
    remove,
    reload: fetchArticles,
  }
}
