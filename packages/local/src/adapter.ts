import type { Adapter, Comment, PinAnchor, Thread } from '@preview-comments/core'

export interface LocalStorageAdapterConfig {
  storageKey?: string
  author?: {
    name: string
    avatarUrl: string
  }
}

interface PersistedState {
  threads: Thread[]
}

const DEFAULT_STORAGE_KEY = 'preview-comments:local-threads'

function createId(prefix: string): string {
  const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${randomPart}`
}

export function createLocalStorageAdapter(config: LocalStorageAdapterConfig = {}): Adapter {
  const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY
  const author = config.author ?? { name: 'Local Reviewer', avatarUrl: '' }
  let inMemoryState: PersistedState = { threads: [] }

  function loadState(): PersistedState {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return inMemoryState
      const parsed = JSON.parse(raw) as PersistedState
      if (!Array.isArray(parsed.threads)) return inMemoryState
      inMemoryState = parsed
      return parsed
    } catch {
      return inMemoryState
    }
  }

  function saveState(state: PersistedState): void {
    inMemoryState = state
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // localStorage can be unavailable in private mode or restricted contexts.
    }
  }

  function withState<T>(updater: (threads: Thread[]) => T): T {
    const state = loadState()
    const result = updater(state.threads)
    saveState(state)
    return result
  }

  return {
    async getThreads(): Promise<Thread[]> {
      return loadState().threads
    },

    async createThread(anchor: PinAnchor, body: string): Promise<Thread> {
      return withState((threads) => {
        const threadId = createId('thread')
        const now = new Date().toISOString()
        const comment: Comment = {
          id: createId('comment'),
          threadId,
          author,
          body,
          createdAt: now,
          resolved: false,
        }

        const thread: Thread = {
          id: threadId,
          anchor,
          comments: [comment],
          resolved: false,
          createdAt: now,
        }

        threads.push(thread)
        return thread
      })
    },

    async resolveThread(threadId: string): Promise<void> {
      withState((threads) => {
        const thread = threads.find((item) => item.id === threadId)
        if (thread) {
          thread.resolved = !thread.resolved
        }
      })
    },

    async deleteThread(threadId: string): Promise<void> {
      withState((threads) => {
        const index = threads.findIndex((item) => item.id === threadId)
        if (index !== -1) {
          threads.splice(index, 1)
        }
      })
    },

    async addComment(threadId: string, body: string): Promise<Comment> {
      return withState((threads) => {
        const thread = threads.find((item) => item.id === threadId)
        if (!thread) {
          throw new Error('Thread not found')
        }

        const comment: Comment = {
          id: createId('comment'),
          threadId,
          author,
          body,
          createdAt: new Date().toISOString(),
          resolved: false,
        }
        thread.comments.push(comment)
        return comment
      })
    },

    async editComment(commentId: string, body: string): Promise<Comment> {
      return withState((threads) => {
        for (const thread of threads) {
          const comment = thread.comments.find((item) => item.id === commentId)
          if (comment) {
            comment.body = body
            return comment
          }
        }
        throw new Error('Comment not found')
      })
    },

    async deleteComment(commentId: string): Promise<void> {
      withState((threads) => {
        for (let threadIndex = 0; threadIndex < threads.length; threadIndex += 1) {
          const thread = threads[threadIndex]
          const commentIndex = thread.comments.findIndex((item) => item.id === commentId)
          if (commentIndex !== -1) {
            thread.comments.splice(commentIndex, 1)
            if (thread.comments.length === 0) {
              threads.splice(threadIndex, 1)
            }
            return
          }
        }
      })
    },
  }
}
