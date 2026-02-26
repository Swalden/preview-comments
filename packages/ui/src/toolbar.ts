import type { Store } from '@preview-comments/core'

const COMMENT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`

export function renderToolbar(store: Store): HTMLElement {
  const toolbar = document.createElement('div')
  toolbar.className = 'pc-toolbar'

  const button = document.createElement('button')
  button.className = 'pc-toolbar-btn'
  button.innerHTML = COMMENT_ICON
  button.title = 'Toggle comment mode'

  const badge = document.createElement('span')
  badge.className = 'pc-badge'
  badge.style.display = 'none'
  button.appendChild(badge)

  button.addEventListener('click', () => {
    const { mode } = store.getState()
    store.setState({
      mode: mode === 'idle' ? 'commenting' : 'idle',
      activeThreadId: null,
    })
  })

  store.subscribe(() => {
    const { mode, threads } = store.getState()
    button.classList.toggle('active', mode === 'commenting')
    const unresolvedCount = threads.filter((thread) => !thread.resolved).length
    badge.textContent = String(unresolvedCount)
    badge.style.display = unresolvedCount > 0 ? 'flex' : 'none'
  })

  toolbar.appendChild(button)
  return toolbar
}
