import { fetchJson } from '../api'
import { renderBlocks } from '../renderBlocks'
import { showError, showLoading, showReady } from '../state'
import type { PagePath, PageResponse } from '../types'
import { renderNotFound } from './notFound'

// isCurrent() returns false if the visitor has already navigated elsewhere,
// so a slow response never overwrites a newer page
export async function renderCmsPage(
  container: HTMLElement,
  path: PagePath,
  siteName: string,
  isCurrent: () => boolean,
): Promise<void> {
  showLoading(container)

  const result = await fetchJson<PageResponse>(`/api/page?path=${encodeURIComponent(path)}`)
  if (!isCurrent()) return

  if (result.status === 'error') {
    if (result.httpStatus === 404) {
      document.title = `Page not found — ${siteName}`
      renderNotFound(container)
      return
    }
    showError(container, result.message, () => {
      void renderCmsPage(container, path, siteName, isCurrent)
    })
    return
  }

  document.title = `${result.data.title} — ${siteName}`
  showReady(container, renderBlocks(result.data.blocks))
}