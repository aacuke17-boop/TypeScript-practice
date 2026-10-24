import type { Endpoint } from 'payload'
import { absoluteUrl, getSearchParams, jsonError } from './helpers'

export const questionnaireEndpoint: Endpoint = {
  path: '/questionnaire',
  method: 'get',
  handler: async (req) => {
    const slug = getSearchParams(req).get('slug')?.trim()
    if (!slug) return jsonError('Parameter "slug" is required')

    const result = await req.payload.find({
      collection: 'questionnaires',
      where: {
        and: [{ slug: { equals: slug } }, { published: { equals: true } }],
      },
      depth: 1,
      limit: 1,
    })

    const q = result.docs[0]
    if (!q) return jsonError('Questionnaire not found', 404)

    const cover = typeof q.cover === 'object' && q.cover !== null ? q.cover : null

    return Response.json({
      id: q.id,
      title: q.title,
      slug: q.slug,
      description: q.description ?? '',
      isTest: Boolean(q.isTest),
      cover: cover?.url ? { url: absoluteUrl(req, cover.url), alt: cover.alt } : null,
      questions: (q.questions ?? []).map((question) => ({
        id: question.id ?? '',
        text: question.text,
        points: q.isTest ? (question.points ?? 0) : 0,
        options: (question.options ?? []).map((option) => ({
          id: option.id ?? '',
          text: option.text,
        })),
      })),
    })
  },
}