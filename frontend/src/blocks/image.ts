import { el } from '../dom'
import type { ImageBlock } from '../types'

export function renderImage(block: ImageBlock): HTMLElement {
  const image = el('img', {
    attrs: { src: block.url, alt: block.alt, loading: 'lazy' },
  })

  return el('figure', { className: 'block block-image' }, [image])
}