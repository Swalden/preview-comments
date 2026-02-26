import type { Adapter } from '@preview-comments/core'
import { PreviewCommentsElement } from './component'

if (typeof customElements !== 'undefined' && !customElements.get('preview-comments')) {
  customElements.define('preview-comments', PreviewCommentsElement)
}

export interface MountOptions {
  adapter: Adapter
  githubClientId?: string
  githubCallbackUrl?: string
}

export function mount(options: MountOptions): PreviewCommentsElement {
  const element = document.createElement('preview-comments') as PreviewCommentsElement
  element.configure(options)
  document.body.appendChild(element)
  return element
}

export { PreviewCommentsElement }
