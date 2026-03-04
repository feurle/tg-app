import { api } from './api'
import type { ImageResponse } from '../types/image'

export const imageService = {
  async getAll(): Promise<ImageResponse[]> {
    return api.get<ImageResponse[]>('/webcontent/images')
  },

  async getDownloadUrl(id: number): Promise<string> {
    return `/api/webcontent/images/${id}/download`
  },

  async upload(file: File): Promise<ImageResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return api.postForm<ImageResponse>('/webcontent/images', formData)
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/webcontent/images/${id}`)
  },
}
