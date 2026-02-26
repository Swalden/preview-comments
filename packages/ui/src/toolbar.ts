import type { Store } from '@preview-comments/core'

const COMMENT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
const SHARE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V3"></path><path d="m6 9 6-6 6 6"></path><path d="M20 21H4"></path></svg>`
const MORE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></svg>`

export function renderToolbar(store: Store): HTMLElement {
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

  const iconShare = document.createElement('button')
  iconShare.className = 'pc-toolbar-icon'
  iconShare.type = 'button'
  iconShare.title = 'Share'
  iconShare.innerHTML = SHARE_ICON

  const iconMore = document.createElement('button')
  iconMore.className = 'pc-toolbar-icon'
  iconMore.type = 'button'
  iconMore.title = 'More'
  iconMore.innerHTML = MORE_ICON

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

  const dividerOne = document.createElement('div')
  dividerOne.className = 'pc-toolbar-divider'

  const dividerTwo = document.createElement('div')
  dividerTwo.className = 'pc-toolbar-divider'

  toolbar.appendChild(primarySegment)
  toolbar.appendChild(dividerOne)
  toolbar.appendChild(iconShare)
  toolbar.appendChild(dividerTwo)
  toolbar.appendChild(iconMore)

  return toolbar
}
