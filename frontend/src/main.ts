import './style.css'
import { fetchJson } from './api'
import { markActiveLink, renderFooter, renderHeader } from './layout'
import { renderCmsPage } from './pages/cmsPage'
import { renderQuestionnairePage } from './pages/questionnairePage'
import { startRouter, type Route } from './router'
import { showError, showLoading } from './state'
import type { CommonResponse } from './types'

function getElement(id: string): HTMLElement {
  const node = document.getElementById(id)
  if (!node) throw new Error(`Element #${id} not found`)
  return node
}

const header = getElement('site-header')
const content = getElement('content')
const footer = getElement('site-footer')

let routerStarted = false
let siteName = ''
let renderCounter = 0

function renderRoute(route: Route): void {
  markActiveLink(header, location.pathname)

  const current = ++renderCounter
  const isCurrent = (): boolean => current === renderCounter

  if (route.kind === 'page') {
    void renderCmsPage(content, route.path, siteName, isCurrent)
  } else {
    void renderQuestionnairePage(content, route.slug, siteName, isCurrent)
  }
}

async function init(): Promise<void> {
  showLoading(content)

  const result = await fetchJson<CommonResponse>('/api/common')
  if (result.status === 'error') {
    showError(content, result.message, () => void init())
    return
  }

  siteName = result.data.siteName
  renderHeader(header, result.data)
  renderFooter(footer, result.data)

  if (!routerStarted) {
    routerStarted = true
    startRouter(renderRoute)
  }
}

void init()