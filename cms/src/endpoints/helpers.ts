import type { PayloadRequest } from 'payload'
import type { Questionnaire } from '../payload-types'

export function getSearchParams(req: PayloadRequest): URLSearchParams {
  return req.url ? new URL(req.url).searchParams : new URLSearchParams()
}

export function absoluteUrl(req: PayloadRequest, url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  const origin = req.url ? new URL(req.url).origin : ''
  return `${origin}${url}`
}

export type QuestionnaireCard = {
  id: number
  title: string
  slug: string
  description: string
  isTest: boolean
  cover: { url: string; alt: string } | null
}

export function toCard(req: PayloadRequest, q: Questionnaire): QuestionnaireCard {
  const cover = typeof q.cover === 'object' && q.cover !== null ? q.cover : null
  return {
    id: q.id,
    title: q.title,
    slug: q.slug,
    description: q.description ?? '',
    isTest: Boolean(q.isTest),
    cover: cover?.url ? { url: absoluteUrl(req, cover.url), alt: cover.alt } : null,
  }
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ message }, { status })
}