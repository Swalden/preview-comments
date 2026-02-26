import type { Adapter, Comment, PinAnchor, Thread } from '@preview-comments/core'
import { parseThread, serializeThread } from './parser'

export interface GitHubAdapterConfig {
  repo: string
  pr: number
  getToken: () => string | null
}

interface GitHubComment {
  id: number
  body: string
  created_at: string
}

interface GitHubUser {
  login: string
  avatar_url: string
}

export function createGitHubAdapter(config: GitHubAdapterConfig): Adapter {
  const { repo, pr, getToken } = config
  const baseUrl = `https://api.github.com/repos/${repo}`

  async function request(path: string, options: RequestInit = {}): Promise<any> {
    const token = getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  function toThread(ghComment: GitHubComment): Thread | null {
    const parsed = parseThread(ghComment.body)
    if (!parsed) {
      return null
    }

    return {
      id: String(ghComment.id),
      anchor: parsed.anchor,
      resolved: parsed.resolved,
      createdAt: ghComment.created_at,
      comments: parsed.comments.map((comment, index) => ({
        id: `${ghComment.id}-${index}`,
        threadId: String(ghComment.id),
        author: { name: comment.author, avatarUrl: '' },
        body: comment.body,
        createdAt: ghComment.created_at,
        resolved: false,
      })),
    }
  }

  return {
    async getThreads() {
      const comments = (await request(`/issues/${pr}/comments`)) as GitHubComment[]
      return comments.map(toThread).filter((thread): thread is Thread => thread !== null)
    },

    async createThread(anchor: PinAnchor, body: string) {
      const user = (await request('/user')) as GitHubUser
      const serialized = serializeThread(anchor, [{ body, author: user.login }])
      const ghComment = (await request(`/issues/${pr}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: serialized }),
      })) as GitHubComment

      const thread = toThread(ghComment)
      if (!thread) {
        throw new Error('Failed to parse created thread')
      }
      return thread
    },

    async resolveThread(threadId: string) {
      const ghComment = (await request(`/issues/comments/${threadId}`)) as GitHubComment
      const parsed = parseThread(ghComment.body)
      if (!parsed) {
        return
      }

      const updated = serializeThread(parsed.anchor, parsed.comments, true)
      await request(`/issues/comments/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body: updated }),
      })
    },

    async deleteThread(threadId: string) {
      await request(`/issues/comments/${threadId}`, { method: 'DELETE' })
    },

    async addComment(threadId: string, body: string): Promise<Comment> {
      const user = (await request('/user')) as GitHubUser
      const ghComment = (await request(`/issues/comments/${threadId}`)) as GitHubComment
      const parsed = parseThread(ghComment.body)
      if (!parsed) {
        throw new Error('Thread not found')
      }

      parsed.comments.push({ body, author: user.login })
      const updated = serializeThread(parsed.anchor, parsed.comments, parsed.resolved)
      await request(`/issues/comments/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body: updated }),
      })

      const index = parsed.comments.length - 1
      return {
        id: `${threadId}-${index}`,
        threadId,
        author: { name: user.login, avatarUrl: user.avatar_url },
        body,
        createdAt: new Date().toISOString(),
        resolved: false,
      }
    },

    async editComment(commentId: string, body: string): Promise<Comment> {
      const [threadId, indexString] = commentId.split('-')
      const index = Number.parseInt(indexString, 10)
      const ghComment = (await request(`/issues/comments/${threadId}`)) as GitHubComment
      const parsed = parseThread(ghComment.body)

      if (!parsed || !parsed.comments[index]) {
        throw new Error('Comment not found')
      }

      parsed.comments[index].body = body
      const updated = serializeThread(parsed.anchor, parsed.comments, parsed.resolved)
      await request(`/issues/comments/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body: updated }),
      })

      return {
        id: commentId,
        threadId,
        author: { name: parsed.comments[index].author, avatarUrl: '' },
        body,
        createdAt: new Date().toISOString(),
        resolved: false,
      }
    },

    async deleteComment(commentId: string): Promise<void> {
      const [threadId, indexString] = commentId.split('-')
      const index = Number.parseInt(indexString, 10)
      const ghComment = (await request(`/issues/comments/${threadId}`)) as GitHubComment
      const parsed = parseThread(ghComment.body)

      if (!parsed) {
        throw new Error('Thread not found')
      }

      parsed.comments.splice(index, 1)
      if (parsed.comments.length === 0) {
        await request(`/issues/comments/${threadId}`, { method: 'DELETE' })
        return
      }

      const updated = serializeThread(parsed.anchor, parsed.comments, parsed.resolved)
      await request(`/issues/comments/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body: updated }),
      })
    },
  }
}
