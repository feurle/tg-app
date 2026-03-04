import { api } from './api'
import type { AuthUser } from '../types/auth'

export const authService = {
  async getMe(): Promise<AuthUser> {
    return api.get<AuthUser>('/auth/me')
  },

  async login(login: string, password: string): Promise<void> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
