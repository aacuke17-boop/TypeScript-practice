import type { ApiErrorBody, ApiResult } from './types'

// No trailing slash, so paths like "/api/page" can be appended safely
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, init)

    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try {
        const body = (await response.json()) as Partial<ApiErrorBody>
        if (typeof body.message === 'string') message = body.message
      } catch {
        // The error response is not JSON, keep the default message
      }
      return { status: 'error', message, httpStatus: response.status }
    }

    const data = (await response.json()) as T
    return { status: 'ok', data }
  } catch (error) {
    // Network failure, wrong URL, CORS rejection or invalid JSON
    const message = error instanceof Error ? error.message : 'Network error'
    return { status: 'error', message }
  }
}

export function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return fetchJson<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}