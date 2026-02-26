import type { Thread } from './types'

export type UIMode = 'idle' | 'commenting'

export interface User {
  name: string
  avatarUrl: string
  token: string
}

export interface State {
  threads: Thread[]
  mode: UIMode
  user: User | null
  activeThreadId: string | null
}

type Listener = () => void

export interface Store {
  getState(): State
  setState(partial: Partial<State>): void
  subscribe(listener: Listener): () => void
}

export function createStore(): Store {
  let state: State = {
    threads: [],
    mode: 'idle',
    user: null,
    activeThreadId: null,
  }
  const listeners = new Set<Listener>()

  return {
    getState() { return state },
    setState(partial) {
      state = { ...state, ...partial }
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
