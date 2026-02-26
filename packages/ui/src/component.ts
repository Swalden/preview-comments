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
} from '@preview-comments/core'
import { baseStyles } from './styles'
import { renderToolbar } from './toolbar'

export interface PreviewCommentsConfigureOptions {
  adapter: Adapter
  githubClientId?: string
  githubCallbackUrl?: string
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
    const { mode, user } = this.store.getState()
    if (mode !== 'commenting') {
      return
    }

    if (event.composedPath().includes(this)) {
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

      try {
        const thread = await this.adapter.createThread(anchor, body)
        this.store.setState({
          threads: [...this.store.getState().threads, thread],
          mode: 'idle',
          activeThreadId: null,
        })
        this.popoverContainer.innerHTML = ''
      } catch {
        submit.textContent = 'Error'
      }
    })

    inputArea.appendChild(input)
    inputArea.appendChild(submit)
    popover.appendChild(inputArea)
    this.popoverContainer.appendChild(popover)
    input.focus()
  }

  private renderPins(): void {
    this.pinsContainer.innerHTML = ''
    const { threads, activeThreadId } = this.store.getState()
    const currentPath = window.location.pathname

    threads
      .filter((thread) => thread.anchor.pathname === currentPath)
      .forEach((thread, index) => {
        const position = resolveAnchor(thread.anchor)
        if (!position) {
          return
        }

        const pin = document.createElement('div')
        pin.className = `pc-pin${thread.resolved ? ' resolved' : ''}`
        pin.style.left = `${position.x}px`
        pin.style.top = `${position.y}px`
        pin.innerHTML = `<span>${index + 1}</span>`

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
