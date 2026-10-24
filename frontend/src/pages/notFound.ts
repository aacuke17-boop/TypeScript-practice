import { el } from '../dom'
import { showReady } from '../state'

export function renderNotFound(container: HTMLElement): void {
  showReady(
    container,
    el('section', { className: 'not-found' }, [
      el('h1', { text: '404' }),
      el('p', { text: 'Page not found' }),
      el('a', { text: 'Back to home', attrs: { href: '/' } }),
    ]),
  )
}