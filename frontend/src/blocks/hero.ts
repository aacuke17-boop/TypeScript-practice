import { el } from '../dom'
import type { HeroBlock } from '../types'

export function renderHero(block: HeroBlock): HTMLElement {
  const section = el('section', { className: 'block block-hero' }, [
    el('h1', { text: block.heading }),
  ])

  if (block.subheading) {
    section.append(el('p', { className: 'hero-subheading', text: block.subheading }))
  }

  return section
}