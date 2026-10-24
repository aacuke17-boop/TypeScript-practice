import { el } from './dom'

export type ViewState = 'loading' | 'error' | 'ready'

export function showLoading(container: HTMLElement): void {
  container.dataset.state = 'loading'
  container.replaceChildren(el('p', { className: 'state-message loading', text: 'Loading…' }))
}

export function showError(container: HTMLElement, message?: string, onRetry?: () => void): void {
  container.dataset.state = 'error'

  const box = el('div', { className: 'state-message error' }, [
    el('p', { className: 'error-title', text: 'Something went wrong' }),
  ])
  if (message) {
    box.append(el('p', { className: 'error-details', text: message }))
  }
  if (onRetry) {
    const retry = el('button', { text: 'Try again', attrs: { type: 'button' } })
    retry.addEventListener('click', onRetry)
    box.append(retry)
  }

  container.replaceChildren(box)
}

export function showReady(container: HTMLElement, ...content: Node[]): void {
  container.dataset.state = 'ready'
  container.replaceChildren(...content)
}