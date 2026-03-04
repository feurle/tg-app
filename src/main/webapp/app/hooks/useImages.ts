import { useState, useEffect } from 'react'
import { imageService } from '../services/image.service'
import type { ImageResponse } from '../types/image'

interface UseImagesResult {
  images: ImageResponse[]
  loading: boolean
  error: string | null
  upload: (file: File) => Promise<ImageResponse>
  remove: (id: number) => Promise<void>
  reload: () => Promise<void>
}

export function useImages(): UseImagesResult {
  const [images, setImages] = useState<ImageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setError(null)
      const data = await imageService.getAll()
      setImages(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch images'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const upload = async (file: File): Promise<ImageResponse> => {
    const result = await imageService.upload(file)
    await fetchImages()
    return result
  }

  const remove = async (id: number): Promise<void> => {
    await imageService.remove(id)
    await fetchImages()
  }

  return {
    images,
    loading,
    error,
    upload,
    remove,
    reload: fetchImages,
  }
}
