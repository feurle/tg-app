// Im Dev: leer lassen → Vite-Proxy leitet /api/* an localhost:8080 weiter (kein CORS)
// Im Prod: VITE_API_URL auf die Backend-URL setzen, z.B. https://api.example.com
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  readonly status: number;
  /** From the `Retry-After` header (delta seconds), set on rate-limited (429) responses. */
  readonly retryAfterSeconds?: number;
  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (header === null || !/^\d+$/.test(header.trim())) return undefined;
  return Number(header);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set('Content-Type', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    let message: string;
    try {
      const json = JSON.parse(body);
      message = json.message ?? (body || response.statusText);
    } catch {
      message = body || response.statusText;
    }
    throw new ApiError(response.status, message, parseRetryAfter(response.headers.get('Retry-After')));
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};

export default apiClient;
