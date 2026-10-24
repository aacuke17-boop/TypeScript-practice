import { el } from '../dom'
import type { TextBlock } from '../types'

export function renderText(block: TextBlock): HTMLElement {
  // Blank lines separate paragraphs; single line breaks are kept by CSS (step 13)
  const paragraphs = block.body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part !== '')

  return el(
    'section',
    { className: 'block block-text' },
    paragraphs.map((part) => el('p', { text: part })),
  )
}