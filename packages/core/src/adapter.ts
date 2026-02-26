import type { Comment, PinAnchor, Thread } from './types'

export interface Adapter {
  getThreads(): Promise<Thread[]>
  createThread(anchor: PinAnchor, body: string): Promise<Thread>
  resolveThread(threadId: string): Promise<void>
  deleteThread(threadId: string): Promise<void>
  addComment(threadId: string, body: string): Promise<Comment>
  editComment(commentId: string, body: string): Promise<Comment>
  deleteComment(commentId: string): Promise<void>
}
