/**
 * Centralized API client for all HTTP requests
 * Handles authentication, error handling, and response parsing
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class APIClient {
  private baseUrl = '/api'

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(this.baseUrl + path, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    return url.toString()
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}`
      throw new Error(errorMessage)
    }
    return response.json()
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options
    const url = this.buildUrl(path, params)

    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })

    return this.handleResponse<T>(response)
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params })
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete(path: string): Promise<void> {
    const response = await fetch(this.buildUrl(path), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
  }

  async postForm<T>(path: string, formData: FormData): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'POST',
      body: formData,
    })

    return this.handleResponse<T>(response)
  }
}

export const api = new APIClient()
