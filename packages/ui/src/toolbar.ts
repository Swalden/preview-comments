import type { Store } from '@preview-comments/core'

const COMMENT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
const LOGOUT_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`

export interface ToolbarOptions {
  onLogout?: () => void
}

export function renderToolbar(store: Store, options: ToolbarOptions = {}): HTMLElement {
  const toolbar = document.createElement('div')
  toolbar.className = 'pc-toolbar'

  const primarySegment = document.createElement('div')
  primarySegment.className = 'pc-toolbar-segment'

  const button = document.createElement('button')
  button.className = 'pc-toolbar-btn'
  button.innerHTML = COMMENT_ICON
  button.title = 'Toggle comment mode'

  const badge = document.createElement('span')
  badge.className = 'pc-badge'
  badge.style.display = 'none'
  button.appendChild(badge)

  const people = document.createElement('div')
  people.className = 'pc-people'

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

    const names = Array.from(
      new Set(
        threads
          .flatMap((thread) => thread.comments.map((comment) => comment.author.name))
          .filter((name) => name.trim().length > 0),
      ),
    ).slice(0, 4)

    people.innerHTML = ''
    for (const name of names) {
      const avatar = document.createElement('span')
      avatar.className = 'pc-avatar'
      avatar.title = name
      avatar.textContent = name[0]?.toUpperCase() ?? '?'
      people.appendChild(avatar)
    }
    people.style.display = names.length > 0 ? 'flex' : 'none'
  })

  primarySegment.appendChild(button)
  primarySegment.appendChild(people)

  toolbar.appendChild(primarySegment)

  if (options.onLogout) {
    const logoutBtn = document.createElement('button')
    logoutBtn.className = 'pc-toolbar-btn pc-logout-btn'
    logoutBtn.innerHTML = LOGOUT_ICON
    logoutBtn.title = 'Sign out'
    logoutBtn.addEventListener('click', () => options.onLogout?.())

    const logoutSegment = document.createElement('div')
    logoutSegment.className = 'pc-toolbar-segment'
    logoutSegment.appendChild(logoutBtn)

    // Only show when user is logged in
    logoutSegment.style.display = 'none'
    store.subscribe(() => {
      const { user } = store.getState()
      logoutSegment.style.display = user ? 'flex' : 'none'
    })

    toolbar.appendChild(logoutSegment)
  }

  return toolbar
}
