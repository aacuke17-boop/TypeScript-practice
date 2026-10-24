import { el } from '../dom'
import type { QuestionnaireCard, QuestionnaireListBlock } from '../types'

function renderCard(item: QuestionnaireCard): HTMLElement {
  const link = el('a', {
    className: 'card-link',
    attrs: { href: `/survey/${encodeURIComponent(item.slug)}` },
  })

  if (item.cover) {
    link.append(
      el('img', {
        className: 'card-cover',
        attrs: { src: item.cover.url, alt: item.cover.alt, loading: 'lazy' },
      }),
    )
  }

  const body = el('div', { className: 'card-body' }, [
    el('span', {
      className: item.isTest ? 'badge badge-test' : 'badge badge-survey',
      text: item.isTest ? 'Test' : 'Survey',
    }),
    el('h3', { className: 'card-title', text: item.title }),
  ])
  if (item.description) {
    body.append(el('p', { className: 'card-description', text: item.description }))
  }

  link.append(body)
  return el('article', { className: 'card' }, [link])
}

export function renderQuestionnaireList(block: QuestionnaireListBlock): HTMLElement {
  const section = el('section', { className: 'block block-list' })

  if (block.heading) {
    section.append(el('h2', { text: block.heading }))
  }

  if (block.items.length === 0) {
    section.append(el('p', { className: 'empty', text: 'No questionnaires yet.' }))
    return section
  }

  section.append(
    el(
      'div',
      { className: 'card-grid' },
      block.items.map((item) => renderCard(item)),
    ),
  )
  return section
}