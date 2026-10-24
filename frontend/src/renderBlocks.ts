import { renderHero } from './blocks/hero'
import { renderImage } from './blocks/image'
import { renderQuestionnaireList } from './blocks/questionnaireList'
import { renderText } from './blocks/text'
import { el } from './dom'
import type { Block } from './types'

// If a new block type is added to the union and not handled in the switch,
// `block` is no longer `never` here and TypeScript reports an error.
function skipUnknown(block: never): null {
  console.warn('Unknown block type:', (block as { type?: string }).type)
  return null
}

export function renderBlock(block: Block): HTMLElement | null {
  switch (block.type) {
    case 'hero':
      return renderHero(block)
    case 'text':
      return renderText(block)
    case 'image':
      return renderImage(block)
    case 'questionnaireList':
      return renderQuestionnaireList(block)
    default:
      return skipUnknown(block)
  }
}

export function renderBlocks(blocks: Block[]): HTMLElement {
  const wrapper = el('div', { className: 'blocks' })

  for (const block of blocks) {
    const node = renderBlock(block)
    if (node) wrapper.append(node)
  }

  return wrapper
}