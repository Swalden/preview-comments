import { describe, it, expect, vi } from 'vitest'
import { createStore } from '../store'

describe('createStore', () => {
  it('initializes with default state', () => {
    const store = createStore()
    expect(store.getState().threads).toEqual([])
    expect(store.getState().mode).toBe('idle')
    expect(store.getState().user).toBeNull()
  })

  it('notifies subscribers on state change', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.setState({ mode: 'commenting' })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getState().mode).toBe('commenting')
  })

  it('unsubscribes correctly', () => {
    const store = createStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    store.setState({ mode: 'commenting' })
    expect(listener).not.toHaveBeenCalled()
  })
})
