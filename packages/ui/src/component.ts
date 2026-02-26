import {
  createAnchor,
  createOAuthManager,
  createStore,
  resolveAnchor,
  type Adapter,
  type OAuthManager,
  type PinAnchor,
  type Store,
  type Thread,
  type User,
} from '@preview-comments/core'
import { baseStyles } from './styles'
import { renderToolbar } from './toolbar'

export interface PreviewCommentsConfigureOptions {
  adapter: Adapter
  githubClientId?: string
  githubCallbackUrl?: string
  initialUser?: User
}

export class PreviewCommentsElement extends HTMLElement {
  private store: Store
  private oauth: OAuthManager | null = null
  private adapter: Adapter | null = null
  private shadowRootEl: ShadowRoot
  private pinsContainer!: HTMLElement
  private popoverContainer!: HTMLElement
  private cleanup: Array<() => void> = []

  constructor() {
    super()
    this.store = createStore()
    this.shadowRootEl = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
    this.cleanup.push(this.store.subscribe(() => this.renderPins()))
    this.cleanup.push(this.store.subscribe(() => this.updateBodyCursor()))
    this.loadThreads()
  }

  disconnectedCallback(): void {
    this.cleanup.forEach((fn) => fn())
    this.cleanup = []
    document.body.style.cursor = ''
  }

  configure(options: PreviewCommentsConfigureOptions): void {
    this.adapter = options.adapter

    if (options.initialUser) {
      this.store.setState({ user: options.initialUser })
    }

    if (options.githubClientId && options.githubCallbackUrl) {
      this.oauth = createOAuthManager({
        clientId: options.githubClientId,
        callbackUrl: options.githubCallbackUrl,
      })

      const existingToken = this.oauth.getToken()
      if (existingToken) {
        this.store.setState({
          user: { name: '', avatarUrl: '', token: existingToken },
        })
      }
    }

    void this.loadThreads()
  }

  private render(): void {
    if (this.shadowRootEl.childNodes.length > 0) {
      return
    }

    const style = document.createElement('style')
    style.textContent = baseStyles
    this.shadowRootEl.appendChild(style)

    const toolbar = renderToolbar(this.store)
    this.shadowRootEl.appendChild(toolbar)

    this.pinsContainer = document.createElement('div')
    this.shadowRootEl.appendChild(this.pinsContainer)

    this.popoverContainer = document.createElement('div')
    this.shadowRootEl.appendChild(this.popoverContainer)

    const onDocumentClick = (event: MouseEvent) => {
      void this.handleDocumentClick(event)
    }
    document.addEventListener('click', onDocumentClick, true)
    this.cleanup.push(() => document.removeEventListener('click', onDocumentClick, true))

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.store.setState({ mode: 'idle', activeThreadId: null })
        this.popoverContainer.innerHTML = ''
      }
    }
    document.addEventListener('keydown', onKeyDown)
    this.cleanup.push(() => document.removeEventListener('keydown', onKeyDown))
  }

  private updateBodyCursor(): void {
    document.body.style.cursor = this.store.getState().mode === 'commenting' ? 'crosshair' : ''
  }

  private async handleDocumentClick(event: MouseEvent): Promise<void> {
    const { mode, user, activeThreadId } = this.store.getState()
    const clickInsideWidget = event.composedPath().includes(this)

    if (activeThreadId && !clickInsideWidget) {
      this.store.setState({ activeThreadId: null })
      this.popoverContainer.innerHTML = ''
    }

    if (mode !== 'commenting') {
      return
    }

    if (clickInsideWidget) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      this.showLogin()
      return
    }

    const target = document.elementFromPoint(event.clientX, event.clientY)
    if (!target) {
      return
    }

    const anchor = createAnchor(target, event.clientX, event.clientY, window.location.pathname)
    this.showNewCommentPopover(anchor, event.clientX, event.clientY)
  }

  private showLogin(): void {
    this.popoverContainer.innerHTML = ''

    const popover = document.createElement('div')
    popover.className = 'pc-popover'
    popover.style.bottom = '80px'
    popover.style.right = '20px'

    const login = document.createElement('div')
    login.className = 'pc-login'

    const message = document.createElement('p')
    message.textContent = 'Sign in with GitHub to leave comments'

    const button = document.createElement('button')
    button.className = 'pc-btn'
    button.textContent = 'Sign in with GitHub'
    button.addEventListener('click', async () => {
      if (!this.oauth) {
        return
      }
      try {
        const token = await this.oauth.openPopup()
        this.store.setState({ user: { name: '', avatarUrl: '', token } })
        this.popoverContainer.innerHTML = ''
        await this.loadThreads()
      } catch {
        message.textContent = 'Authentication failed. Try again.'
      }
    })

    login.appendChild(message)
    login.appendChild(button)
    popover.appendChild(login)
    this.popoverContainer.appendChild(popover)
  }

  private showNewCommentPopover(anchor: PinAnchor, x: number, y: number): void {
    this.popoverContainer.innerHTML = ''

    const popover = document.createElement('div')
    popover.className = 'pc-popover'
    popover.style.left = `${x + 16}px`
    popover.style.top = `${y}px`

    const inputArea = document.createElement('div')
    inputArea.className = 'pc-input-area'

    const input = document.createElement('textarea')
    input.className = 'pc-input'
    input.placeholder = 'Leave a comment...'
    input.rows = 2

    const status = document.createElement('div')
    status.className = 'pc-inline-status'
    status.style.display = 'none'

    const submit = document.createElement('button')
    submit.className = 'pc-btn'
    submit.textContent = 'Post'
    submit.addEventListener('click', async () => {
      const body = input.value.trim()
      if (!body || !this.adapter) {
        return
      }

      submit.disabled = true
      submit.textContent = '...'
      status.style.display = 'none'
      status.textContent = ''

      try {
        const thread = await this.adapter.createThread(anchor, body)
        this.store.setState({
          threads: [...this.store.getState().threads, thread],
          mode: 'idle',
          activeThreadId: null,
        })
        this.popoverContainer.innerHTML = ''
      } catch (error) {
        submit.disabled = false
        submit.textContent = 'Post'
        status.textContent = error instanceof Error ? error.message : 'Failed to create comment.'
        status.style.display = 'block'
      }
    })

    inputArea.appendChild(input)
    inputArea.appendChild(submit)
    popover.appendChild(inputArea)
    popover.appendChild(status)
    this.popoverContainer.appendChild(popover)
    input.focus()
  }

  private renderPins(): void {
    this.pinsContainer.innerHTML = ''
    const { threads, activeThreadId } = this.store.getState()
    const currentPath = window.location.pathname

    threads
      .filter((thread) => thread.anchor.pathname === currentPath)
      .forEach((thread) => {
        const position = resolveAnchor(thread.anchor)
        if (!position) {
          return
        }

        const pin = document.createElement('div')
        pin.className = `pc-pin${thread.resolved ? ' resolved' : ''}`
        pin.style.left = `${position.x}px`
        pin.style.top = `${position.y}px`
        pin.appendChild(this.createPinAvatars(thread))

        pin.addEventListener('click', (event) => {
          event.stopPropagation()
          if (activeThreadId === thread.id) {
            this.store.setState({ activeThreadId: null })
            this.popoverContainer.innerHTML = ''
            return
          }

          this.store.setState({ activeThreadId: thread.id })
          this.showThreadPopover(thread, position.x, position.y)
        })

        this.pinsContainer.appendChild(pin)
      })
  }

  private createPinAvatars(thread: Thread): HTMLElement {
    const users = this.getThreadParticipants(thread)
    const container = document.createElement('div')
    container.className = 'pc-pin-stack'

    const visibleUsers = users.slice(0, 3)
    for (const user of visibleUsers) {
      const avatar = document.createElement('span')
      avatar.className = 'pc-pin-mini'
      avatar.title = user.name
      avatar.textContent = this.getInitials(user.name)
      avatar.style.background = this.getAvatarColor(user.name)
      container.appendChild(avatar)
    }

    const overflow = users.length - visibleUsers.length
    if (overflow > 0) {
      const extra = document.createElement('span')
      extra.className = 'pc-pin-overflow'
      extra.title = `${overflow} more`
      extra.textContent = `+${overflow}`
      container.appendChild(extra)
    }

    if (users.length === 0) {
      const fallback = document.createElement('span')
      fallback.className = 'pc-pin-mini'
      fallback.textContent = '?'
      fallback.style.background = '#9ca3af'
      container.appendChild(fallback)
    }

    return container
  }

  private getThreadParticipants(thread: Thread): Array<{ name: string }> {
    const uniqueNames = new Set<string>()
    const participants: Array<{ name: string }> = []

    for (const comment of thread.comments) {
      const name = comment.author.name.trim()
      if (!name || uniqueNames.has(name)) {
        continue
      }
      uniqueNames.add(name)
      participants.push({ name })
    }

    return participants
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  private getAvatarColor(seed: string): string {
    const palette = [
      'linear-gradient(135deg, #f59e0b, #f97316)',
      'linear-gradient(135deg, #22d3ee, #06b6d4)',
      'linear-gradient(135deg, #4f46e5, #6366f1)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #84cc16, #22c55e)',
      'linear-gradient(135deg, #a855f7, #8b5cf6)',
    ]

    let hash = 0
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    }
    return palette[hash % palette.length]
  }

  private showThreadPopover(thread: Thread, x: number, y: number): void {
    this.popoverContainer.innerHTML = ''

    const popover = document.createElement('div')
    popover.className = 'pc-popover'
    popover.style.left = `${x + 20}px`
    popover.style.top = `${y}px`

    const header = document.createElement('div')
    header.className = 'pc-popover-header'
    header.innerHTML = `<span>${thread.anchor.pathname}</span>`

    const actions = document.createElement('div')

    const resolve = document.createElement('button')
    resolve.className = 'pc-btn-ghost'
    resolve.textContent = thread.resolved ? 'Reopen' : 'Resolve'
    resolve.addEventListener('click', async () => {
      if (!this.adapter) {
        return
      }
      await this.adapter.resolveThread(thread.id)
      await this.loadThreads()
    })

    const remove = document.createElement('button')
    remove.className = 'pc-btn-ghost'
    remove.textContent = 'Delete'
    remove.addEventListener('click', async () => {
      if (!this.adapter) {
        return
      }
      await this.adapter.deleteThread(thread.id)
      this.store.setState({
        threads: this.store.getState().threads.filter((candidate) => candidate.id !== thread.id),
        activeThreadId: null,
      })
      this.popoverContainer.innerHTML = ''
    })

    actions.appendChild(resolve)
    actions.appendChild(remove)
    header.appendChild(actions)
    popover.appendChild(header)

    for (const comment of thread.comments) {
      const commentElement = document.createElement('div')
      commentElement.className = 'pc-comment'
      commentElement.innerHTML = `
        <div class="pc-comment-author">${comment.author.name}</div>
        <div class="pc-comment-body">${comment.body}</div>
        <div class="pc-comment-time">${new Date(comment.createdAt).toLocaleString()}</div>
      `
      popover.appendChild(commentElement)
    }

    const inputArea = document.createElement('div')
    inputArea.className = 'pc-input-area'

    const input = document.createElement('textarea')
    input.className = 'pc-input'
    input.placeholder = 'Reply...'
    input.rows = 1

    const reply = document.createElement('button')
    reply.className = 'pc-btn'
    reply.textContent = 'Reply'
    reply.addEventListener('click', async () => {
      const body = input.value.trim()
      if (!body || !this.adapter) {
        return
      }
      await this.adapter.addComment(thread.id, body)
      await this.loadThreads()

      const updated = this.store.getState().threads.find((candidate) => candidate.id === thread.id)
      if (updated) {
        this.showThreadPopover(updated, x, y)
      }
    })

    inputArea.appendChild(input)
    inputArea.appendChild(reply)
    popover.appendChild(inputArea)
    this.popoverContainer.appendChild(popover)
  }

  private async loadThreads(): Promise<void> {
    if (!this.adapter) {
      return
    }
    try {
      const threads = await this.adapter.getThreads()
      this.store.setState({ threads })
    } catch {
      // Most likely unauthenticated; leave UI usable for auth flow.
    }
  }
}
