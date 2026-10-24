import type { Endpoint, PayloadRequest } from 'payload'
import type { Page, Questionnaire } from '../payload-types'
import { absoluteUrl, getSearchParams, toCard } from './helpers'

type LayoutBlock = Page['layout'][number]

function normalizePath(raw: string | null): string {
  let p = (raw ?? '/').trim().toLowerCase()
  if (!p.startsWith('/')) p = `/${p}`
  p = p.replace(/\/+$/, '') || '/'
  return p
}

async function mapBlock(req: PayloadRequest, block: LayoutBlock) {
  const id = block.id ?? ''

  switch (block.blockType) {
    case 'hero':
      return {
        id,
        type: 'hero' as const,
        heading: block.heading,
        subheading: block.subheading ?? '',
      }

    case 'text':
      return {
        id,
        type: 'text' as const,
        body: block.body,
      }

    case 'image': {
      const media = block.image
      if (typeof media !== 'object' || media === null || !media.url) return null
      return {
        id,
        type: 'image' as const,
        url: absoluteUrl(req, media.url),
        alt: media.alt,
      }
    }

    case 'questionnaireList': {
      const selected = block.items ?? []
      let docs: Questionnaire[]

      if (selected.length > 0) {
        docs = selected.filter(
          (item): item is Questionnaire => typeof item === 'object' && item !== null,
        )
      } else {
        const result = await req.payload.find({
          collection: 'questionnaires',
          where: { published: { equals: true } },
          sort: '-createdAt',
          depth: 1,
          limit: 100,
        })
        docs = result.docs
      }

      return {
        id,
        type: 'questionnaireList' as const,
        heading: block.heading ?? '',
        items: docs.filter((q) => q.published).map((q) => toCard(req, q)),
      }
    }

    default:
      return null
  }
}

export const pageEndpoint: Endpoint = {
  path: '/page',
  method: 'get',
  handler: async (req) => {
    const path = normalizePath(getSearchParams(req).get('path'))

    const result = await req.payload.find({
      collection: 'pages',
      where: { path: { equals: path } },
      depth: 2,
      limit: 1,
    })

    const page = result.docs[0]
    if (!page) {
      return Response.json({ message: 'Page not found' }, { status: 404 })
    }

    const mapped = await Promise.all(page.layout.map((block) => mapBlock(req, block)))
    const blocks = mapped.filter((b): b is NonNullable<typeof b> => b !== null)

    return Response.json({
      title: page.title,
      path: page.path,
      blocks,
    })
  },
}