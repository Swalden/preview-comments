# Preview Comments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `@preview-comments/*` — an open-source, framework-agnostic commenting widget for preview environments that stores comments via pluggable adapters (GitHub PR comments as default).

**Architecture:** Three-package monorepo: `core` (types, anchoring, state, OAuth), `ui` (Web Component with Shadow DOM), `github` (adapter). Built with TypeScript, bundled with tsup, tested with Vitest. No UI framework — vanilla DOM for minimal bundle size.

**Tech Stack:** TypeScript, tsup, Vitest, pnpm workspaces, Web Components, Shadow DOM, GitHub REST API

---

## Task 1: Monorepo scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json` (root)
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsup.config.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/tsup.config.ts`
- Create: `packages/ui/src/index.ts`
- Create: `packages/github/package.json`
- Create: `packages/github/tsconfig.json`
- Create: `packages/github/tsup.config.ts`
- Create: `packages/github/src/index.ts`
- Create: `.gitignore`

**Step 1: Create root package.json and workspace config**

```json
// package.json
{
  "name": "preview-comments",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "dev": "pnpm -r --parallel dev"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsup": "^8.0.0",
    "vitest": "^3.0.0"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
  - examples/*
```

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

```gitignore
# .gitignore
node_modules/
dist/
*.tgz
.turbo/
```

**Step 2: Create packages/core scaffolding**

```json
// packages/core/package.json
{
  "name": "@preview-comments/core",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "license": "MIT"
}
```

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```ts
// packages/core/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

```ts
// packages/core/src/index.ts
export {}
```

**Step 3: Create packages/ui scaffolding**

```json
// packages/ui/package.json
{
  "name": "@preview-comments/ui",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "@preview-comments/core": "workspace:*"
  },
  "license": "MIT"
}
```

```json
// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```ts
// packages/ui/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

```ts
// packages/ui/src/index.ts
export {}
```

**Step 4: Create packages/github scaffolding**

```json
// packages/github/package.json
{
  "name": "@preview-comments/github",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "@preview-comments/core": "workspace:*"
  },
  "license": "MIT"
}
```

```json
// packages/github/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```ts
// packages/github/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

```ts
// packages/github/src/index.ts
export {}
```

**Step 5: Install dependencies and verify build**

Run: `pnpm install && pnpm build`
Expected: All three packages build successfully with empty exports.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold monorepo with core, ui, and github packages"
```

---

## Task 2: Core types and adapter interface

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/adapter.ts`
- Modify: `packages/core/src/index.ts`
- Create: `packages/core/src/__tests__/types.test.ts`

**Step 1: Write test for type validation helpers**

```ts
// packages/core/src/__tests__/types.test.ts
import { describe, it, expect } from 'vitest'
import { isPinAnchor } from '../types'

describe('isPinAnchor', () => {
  it('returns true for a valid PinAnchor', () => {
    expect(isPinAnchor({
      selector: '#main',
      offsetXPercent: 0.5,
      offsetYPercent: 0.3,
      pageXPercent: 0.25,
      pageYPercent: 0.15,
      pathname: '/products/123',
      viewport: { width: 1920, height: 1080 },
    })).toBe(true)
  })

  it('returns false for missing fields', () => {
    expect(isPinAnchor({ selector: '#main' })).toBe(false)
  })

  it('returns false for non-objects', () => {
    expect(isPinAnchor(null)).toBe(false)
    expect(isPinAnchor('string')).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run`
Expected: FAIL — `isPinAnchor` not found

**Step 3: Write types and adapter interface**

```ts
// packages/core/src/types.ts
export interface PinAnchor {
  selector: string
  offsetXPercent: number
  offsetYPercent: number
  pageXPercent: number
  pageYPercent: number
  pathname: string
  viewport: { width: number; height: number }
}

export interface Comment {
  id: string
  threadId: string
  author: { name: string; avatarUrl: string }
  body: string
  createdAt: string
  resolved: boolean
}

export interface Thread {
  id: string
  anchor: PinAnchor
  comments: Comment[]
  resolved: boolean
  createdAt: string
}

const PIN_ANCHOR_KEYS: (keyof PinAnchor)[] = [
  'selector', 'offsetXPercent', 'offsetYPercent',
  'pageXPercent', 'pageYPercent', 'pathname', 'viewport',
]

/** Runtime guard for PinAnchor shape. */
export function isPinAnchor(value: unknown): value is PinAnchor {
  if (typeof value !== 'object' || value === null) return false
  return PIN_ANCHOR_KEYS.every((key) => key in value)
}
```

```ts
// packages/core/src/adapter.ts
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
```

```ts
// packages/core/src/index.ts
export type { Adapter } from './adapter'
export type { Comment, PinAnchor, Thread } from './types'
export { isPinAnchor } from './types'
```

**Step 4: Run test to verify it passes**

Run: `cd packages/core && npx vitest run`
Expected: PASS

**Step 5: Build to confirm exports work**

Run: `pnpm build`
Expected: All packages build, `packages/core/dist/index.d.ts` exports types.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add types and adapter interface"
```

---

## Task 3: Selector generator

Generates a stable CSS selector for a clicked element.

**Files:**
- Create: `packages/core/src/selector.ts`
- Create: `packages/core/src/__tests__/selector.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests**

```ts
// packages/core/src/__tests__/selector.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { generateSelector } from '../selector'

describe('generateSelector', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('prefers data-testid', () => {
    container.innerHTML = '<button data-testid="submit-btn">Submit</button>'
    const el = container.querySelector('button')!
    expect(generateSelector(el)).toBe('[data-testid="submit-btn"]')
  })

  it('falls back to id', () => {
    container.innerHTML = '<button id="my-btn">Click</button>'
    const el = container.querySelector('button')!
    expect(generateSelector(el)).toBe('#my-btn')
  })

  it('generates a path selector when no id or testid', () => {
    container.innerHTML = '<div><span><a>Link</a></span></div>'
    const el = container.querySelector('a')!
    const selector = generateSelector(el)
    // The generated selector should resolve back to the same element
    expect(document.querySelector(selector)).toBe(el)
  })

  it('handles body as root', () => {
    const selector = generateSelector(document.body)
    expect(selector).toBe('body')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run`
Expected: FAIL — `generateSelector` not found

**Step 3: Implement selector generator**

```ts
// packages/core/src/selector.ts

/** Generate a stable CSS selector for an element. */
export function generateSelector(el: Element): string {
  // Priority 1: data-testid
  const testId = el.getAttribute('data-testid')
  if (testId) return `[data-testid="${testId}"]`

  // Priority 2: id
  if (el.id) return `#${el.id}`

  // Priority 3: build path from root
  const path: string[] = []
  let current: Element | null = el

  while (current && current !== document.documentElement) {
    if (current === document.body) {
      path.unshift('body')
      break
    }

    const testId = current.getAttribute('data-testid')
    if (testId) {
      path.unshift(`[data-testid="${testId}"]`)
      break
    }
    if (current.id) {
      path.unshift(`#${current.id}`)
      break
    }

    const parent = current.parentElement
    if (!parent) {
      path.unshift(current.tagName.toLowerCase())
      break
    }

    const siblings = Array.from(parent.children)
    const sameTag = siblings.filter((s) => s.tagName === current!.tagName)
    const tag = current.tagName.toLowerCase()

    if (sameTag.length === 1) {
      path.unshift(tag)
    } else {
      const index = sameTag.indexOf(current) + 1
      path.unshift(`${tag}:nth-of-type(${index})`)
    }

    current = parent
  }

  return path.join(' > ')
}
```

Add to exports:

```ts
// packages/core/src/index.ts — add line:
export { generateSelector } from './selector'
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && npx vitest run`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(core): add CSS selector generator"
```

---

## Task 4: Pin anchoring engine

Creates and resolves `PinAnchor` objects from click events.

**Files:**
- Create: `packages/core/src/anchor.ts`
- Create: `packages/core/src/__tests__/anchor.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests**

```ts
// packages/core/src/__tests__/anchor.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createAnchor, resolveAnchor } from '../anchor'

describe('createAnchor', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app'
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 100, top: 200, width: 400, height: 300, right: 500, bottom: 500 }),
    })
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('creates an anchor from element and click coordinates', () => {
    const anchor = createAnchor(container, 200, 350, '/products')
    expect(anchor.selector).toBe('#app')
    expect(anchor.offsetXPercent).toBeCloseTo(0.25) // (200-100)/400
    expect(anchor.offsetYPercent).toBeCloseTo(0.5)  // (350-200)/300
    expect(anchor.pathname).toBe('/products')
    expect(anchor.viewport.width).toBeGreaterThan(0)
  })
})

describe('resolveAnchor', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app'
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 100, top: 200, width: 400, height: 300, right: 500, bottom: 500 }),
    })
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('resolves position from selector + offset', () => {
    const pos = resolveAnchor({
      selector: '#app',
      offsetXPercent: 0.25,
      offsetYPercent: 0.5,
      pageXPercent: 0.1,
      pageYPercent: 0.2,
      pathname: '/products',
      viewport: { width: 1920, height: 1080 },
    })
    expect(pos).not.toBeNull()
    expect(pos!.x).toBeCloseTo(200) // 100 + 0.25*400
    expect(pos!.y).toBeCloseTo(350) // 200 + 0.5*300
    expect(pos!.strategy).toBe('selector')
  })

  it('falls back to page position when selector not found', () => {
    const pos = resolveAnchor({
      selector: '#nonexistent',
      offsetXPercent: 0.5,
      offsetYPercent: 0.5,
      pageXPercent: 0.3,
      pageYPercent: 0.4,
      pathname: '/products',
      viewport: { width: 1000, height: 800 },
    })
    expect(pos).not.toBeNull()
    expect(pos!.strategy).toBe('page')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run`
Expected: FAIL

**Step 3: Implement anchor engine**

```ts
// packages/core/src/anchor.ts
import type { PinAnchor } from './types'
import { generateSelector } from './selector'

export interface ResolvedPosition {
  x: number
  y: number
  strategy: 'selector' | 'page'
}

/** Create a PinAnchor from a click on an element. */
export function createAnchor(
  element: Element,
  clientX: number,
  clientY: number,
  pathname: string,
): PinAnchor {
  const rect = element.getBoundingClientRect()
  return {
    selector: generateSelector(element),
    offsetXPercent: (clientX - rect.left) / rect.width,
    offsetYPercent: (clientY - rect.top) / rect.height,
    pageXPercent: clientX / window.innerWidth,
    pageYPercent: clientY / window.innerHeight,
    pathname,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  }
}

/** Resolve a PinAnchor back to screen coordinates. */
export function resolveAnchor(anchor: PinAnchor): ResolvedPosition | null {
  const el = document.querySelector(anchor.selector)
  if (el) {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + anchor.offsetXPercent * rect.width,
      y: rect.top + anchor.offsetYPercent * rect.height,
      strategy: 'selector',
    }
  }

  // Fallback: page percentage
  return {
    x: anchor.pageXPercent * window.innerWidth,
    y: anchor.pageYPercent * window.innerHeight,
    strategy: 'page',
  }
}
```

Add to exports:

```ts
// packages/core/src/index.ts — add lines:
export { createAnchor, resolveAnchor } from './anchor'
export type { ResolvedPosition } from './anchor'
```

**Step 4: Run tests**

Run: `cd packages/core && npx vitest run`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(core): add pin anchoring engine"
```

---

## Task 5: State store

Reactive store that holds threads, auth state, and UI mode.

**Files:**
- Create: `packages/core/src/store.ts`
- Create: `packages/core/src/__tests__/store.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests**

```ts
// packages/core/src/__tests__/store.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run`
Expected: FAIL

**Step 3: Implement store**

```ts
// packages/core/src/store.ts
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
    getState() {
      return state
    },
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
```

Add to exports:

```ts
// packages/core/src/index.ts — add lines:
export { createStore } from './store'
export type { State, Store, UIMode, User } from './store'
```

**Step 4: Run tests**

Run: `cd packages/core && npx vitest run`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(core): add reactive state store"
```

---

## Task 6: OAuth flow manager

Handles GitHub OAuth popup flow and token persistence.

**Files:**
- Create: `packages/core/src/oauth.ts`
- Create: `packages/core/src/__tests__/oauth.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests**

```ts
// packages/core/src/__tests__/oauth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOAuthManager } from '../oauth'

describe('createOAuthManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves a token', () => {
    const oauth = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    oauth.setToken('ghp_abc123')
    expect(oauth.getToken()).toBe('ghp_abc123')
  })

  it('persists token in localStorage', () => {
    const oauth = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    oauth.setToken('ghp_abc123')

    const oauth2 = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    expect(oauth2.getToken()).toBe('ghp_abc123')
  })

  it('clears token on logout', () => {
    const oauth = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    oauth.setToken('ghp_abc123')
    oauth.clearToken()
    expect(oauth.getToken()).toBeNull()
  })

  it('builds correct auth URL', () => {
    const oauth = createOAuthManager({ clientId: 'my-client', callbackUrl: 'http://localhost/cb' })
    const url = oauth.getAuthUrl()
    expect(url).toContain('client_id=my-client')
    expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcb')
    expect(url).toContain('scope=repo')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && npx vitest run`
Expected: FAIL

**Step 3: Implement OAuth manager**

```ts
// packages/core/src/oauth.ts
const STORAGE_KEY = 'preview-comments:github-token'

export interface OAuthConfig {
  clientId: string
  callbackUrl: string
}

export interface OAuthManager {
  getToken(): string | null
  setToken(token: string): void
  clearToken(): void
  getAuthUrl(): string
  openPopup(): Promise<string>
}

export function createOAuthManager(config: OAuthConfig): OAuthManager {
  const { clientId, callbackUrl } = config

  function getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  }

  function setToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      // localStorage unavailable
    }
  }

  function clearToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable
    }
  }

  function getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'repo',
    })
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  function openPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = getAuthUrl()
      const popup = window.open(url, 'preview-comments-auth', 'width=600,height=700')
      if (!popup) {
        reject(new Error('Popup blocked'))
        return
      }

      function onMessage(event: MessageEvent) {
        if (event.data?.type === 'preview-comments:token') {
          window.removeEventListener('message', onMessage)
          const token = event.data.token as string
          setToken(token)
          resolve(token)
        }
        if (event.data?.type === 'preview-comments:error') {
          window.removeEventListener('message', onMessage)
          reject(new Error(event.data.message ?? 'OAuth failed'))
        }
      }

      window.addEventListener('message', onMessage)
    })
  }

  return { getToken, setToken, clearToken, getAuthUrl, openPopup }
}
```

Add to exports:

```ts
// packages/core/src/index.ts — add lines:
export { createOAuthManager } from './oauth'
export type { OAuthConfig, OAuthManager } from './oauth'
```

**Step 4: Run tests**

Run: `cd packages/core && npx vitest run`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(core): add OAuth flow manager"
```

---

## Task 7: GitHub adapter

Implements the `Adapter` interface using GitHub PR comments API.

**Files:**
- Create: `packages/github/src/adapter.ts`
- Create: `packages/github/src/parser.ts`
- Create: `packages/github/src/__tests__/parser.test.ts`
- Create: `packages/github/src/__tests__/adapter.test.ts`
- Modify: `packages/github/src/index.ts`

**Step 1: Write failing tests for the comment parser**

The parser converts between our `Thread` objects and GitHub comment markdown bodies.

```ts
// packages/github/src/__tests__/parser.test.ts
import { describe, it, expect } from 'vitest'
import { serializeThread, parseThread } from '../parser'
import type { PinAnchor, Thread } from '@preview-comments/core'

const anchor: PinAnchor = {
  selector: '#app',
  offsetXPercent: 0.5,
  offsetYPercent: 0.3,
  pageXPercent: 0.25,
  pageYPercent: 0.15,
  pathname: '/products/123',
  viewport: { width: 1920, height: 1080 },
}

describe('serializeThread', () => {
  it('produces markdown with hidden metadata', () => {
    const body = serializeThread(anchor, [
      { body: 'This button looks off', author: 'alice' },
    ])
    expect(body).toContain('Preview comment')
    expect(body).toContain('/products/123')
    expect(body).toContain('This button looks off')
    expect(body).toContain('<!-- preview-comments:')
  })
})

describe('parseThread', () => {
  it('round-trips through serialize/parse', () => {
    const body = serializeThread(anchor, [
      { body: 'Looks broken', author: 'alice' },
    ])
    const parsed = parseThread(body)
    expect(parsed).not.toBeNull()
    expect(parsed!.anchor.selector).toBe('#app')
    expect(parsed!.anchor.pathname).toBe('/products/123')
    expect(parsed!.comments).toHaveLength(1)
    expect(parsed!.comments[0].body).toBe('Looks broken')
  })

  it('returns null for non-preview-comments body', () => {
    expect(parseThread('Just a regular PR comment')).toBeNull()
  })

  it('parses multiple replies', () => {
    const body = serializeThread(anchor, [
      { body: 'First comment', author: 'alice' },
      { body: 'Second comment', author: 'bob' },
    ])
    const parsed = parseThread(body)
    expect(parsed!.comments).toHaveLength(2)
    expect(parsed!.comments[1].body).toBe('Second comment')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/github && npx vitest run`
Expected: FAIL

**Step 3: Implement parser**

```ts
// packages/github/src/parser.ts
import type { PinAnchor } from '@preview-comments/core'

const METADATA_PREFIX = '<!-- preview-comments:'
const METADATA_SUFFIX = ' -->'
const REPLY_SEPARATOR = '\n\n---\n\n'

interface SerializedComment {
  body: string
  author: string
}

interface ParsedThread {
  anchor: PinAnchor
  resolved: boolean
  comments: SerializedComment[]
}

export function serializeThread(
  anchor: PinAnchor,
  comments: SerializedComment[],
  resolved = false,
): string {
  const metadata = JSON.stringify({ anchor, resolved })
  const header = `📌 **Preview comment** on \`${anchor.pathname}\``

  const commentBlocks = comments.map(
    (c) => `**${c.author}:**\n${c.body}`,
  )

  return [
    header,
    '',
    commentBlocks.join(REPLY_SEPARATOR),
    '',
    `${METADATA_PREFIX}${metadata}${METADATA_SUFFIX}`,
  ].join('\n')
}

export function parseThread(body: string): ParsedThread | null {
  const metaStart = body.indexOf(METADATA_PREFIX)
  if (metaStart === -1) return null

  const jsonStart = metaStart + METADATA_PREFIX.length
  const metaEnd = body.indexOf(METADATA_SUFFIX, jsonStart)
  if (metaEnd === -1) return null

  try {
    const metadata = JSON.parse(body.slice(jsonStart, metaEnd))
    const { anchor, resolved } = metadata

    // Parse comments from body (between header and metadata)
    const contentEnd = metaStart
    const lines = body.slice(0, contentEnd).trim()

    // Skip the header line (first line starting with 📌)
    const headerEnd = lines.indexOf('\n')
    const content = headerEnd === -1 ? '' : lines.slice(headerEnd + 1).trim()

    const comments: SerializedComment[] = []
    if (content) {
      const blocks = content.split('---')
      for (const block of blocks) {
        const trimmed = block.trim()
        const authorMatch = trimmed.match(/^\*\*(.+?):\*\*\n([\s\S]+)$/)
        if (authorMatch) {
          comments.push({ author: authorMatch[1], body: authorMatch[2].trim() })
        }
      }
    }

    return { anchor, resolved: resolved ?? false, comments }
  } catch {
    return null
  }
}
```

**Step 4: Run parser tests**

Run: `cd packages/github && npx vitest run`
Expected: PASS

**Step 5: Implement GitHub adapter**

```ts
// packages/github/src/adapter.ts
import type { Adapter, Comment, PinAnchor, Thread } from '@preview-comments/core'
import { parseThread, serializeThread } from './parser'

export interface GitHubAdapterConfig {
  repo: string        // "owner/repo"
  pr: number
  getToken: () => string | null
}

export function createGitHubAdapter(config: GitHubAdapterConfig): Adapter {
  const { repo, pr, getToken } = config
  const baseUrl = `https://api.github.com/repos/${repo}`

  async function request(path: string, options: RequestInit = {}) {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
    if (res.status === 204) return null
    return res.json()
  }

  function toThread(ghComment: any): Thread | null {
    const parsed = parseThread(ghComment.body)
    if (!parsed) return null
    return {
      id: String(ghComment.id),
      anchor: parsed.anchor,
      resolved: parsed.resolved,
      createdAt: ghComment.created_at,
      comments: parsed.comments.map((c, i) => ({
        id: `${ghComment.id}-${i}`,
        threadId: String(ghComment.id),
        author: { name: c.author, avatarUrl: '' },
        body: c.body,
        createdAt: ghComment.created_at,
        resolved: false,
      })),
    }
  }

  return {
    async getThreads() {
      const comments = await request(`/issues/${pr}/comments`)
      return comments.map(toThread).filter(Boolean) as Thread[]
    },

    async createThread(anchor: PinAnchor, body: string) {
      const token = getToken()
      const user = await request('/user')
      const markdown = serializeThread(anchor, [{ body, author: user.login }])
      const ghComment = await request(`/issues/${pr}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: markdown }),
      })
      return toThread(ghComment)!
    },

    async resolveThread(threadId: string) {
      const ghComment = await request(`/issues/comments/${threadId}`)
      const parsed = parseThread(ghComment.body)
      if (!parsed) return
      const updated = serializeThread(parsed.anchor, parsed.comments, true)
      await request(`/issues/comments/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body: updated }),
      })
    },

    async deleteThread(threadId: string) {
      await request(`/issues/comments/${threadId}`, { method: 'DELETE' })
    },

    async addComment(threadId: string, body: string) {
      const token = getToken()
      const user = await request('/user')
      const ghComment = await request(`/issues/comments/${threadId}`)
      const parsed = parseThread(ghComment.body)
      if (!parsed) throw new Error('Thread not found')
      parsed.comments.push({ body, author: user.login })
      const updated = serializeThread(parsed.anchor, parsed.comments, parsed.resolved)
      await request(`/issues/comments/${threadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body: updated }),
      })
      const idx = parsed.comments.length - 1
      return {
        id: `${threadId}-${idx}`,
        threadId,
        author: { name: user.login, avatarUrl: user.avatar_url },
        body,
        createdAt: new Date().toISOString(),
        resolved: false,
      }
    },

    async editComment(commentId: string, body: string) {
      const [threadId, indexStr] = commentId.split('-')
      const index = parseInt(indexStr, 10)
      const ghComment = await request(`/issues/comments/${threadId}`)
      const parsed = parseThread(ghComment.body)
      if (!parsed || !parsed.comments[index]) throw new Error('Comment not found')
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

    async deleteComment(commentId: string) {
      const [threadId, indexStr] = commentId.split('-')
      const index = parseInt(indexStr, 10)
      const ghComment = await request(`/issues/comments/${threadId}`)
      const parsed = parseThread(ghComment.body)
      if (!parsed) throw new Error('Thread not found')
      parsed.comments.splice(index, 1)
      if (parsed.comments.length === 0) {
        await request(`/issues/comments/${threadId}`, { method: 'DELETE' })
      } else {
        const updated = serializeThread(parsed.anchor, parsed.comments, parsed.resolved)
        await request(`/issues/comments/${threadId}`, {
          method: 'PATCH',
          body: JSON.stringify({ body: updated }),
        })
      }
    },
  }
}
```

```ts
// packages/github/src/index.ts
export { createGitHubAdapter } from './adapter'
export type { GitHubAdapterConfig } from './adapter'
export { serializeThread, parseThread } from './parser'
```

**Step 6: Run all tests, build**

Run: `pnpm test && pnpm build`
Expected: All tests pass, all packages build.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat(github): add GitHub PR comments adapter"
```

---

## Task 8: UI — Web Component shell and toolbar

**Files:**
- Create: `packages/ui/src/component.ts`
- Create: `packages/ui/src/styles.ts`
- Create: `packages/ui/src/toolbar.ts`
- Modify: `packages/ui/src/index.ts`

**Step 1: Implement the styles module**

```ts
// packages/ui/src/styles.ts
export const baseStyles = `
  :host {
    --pc-accent: #0070f3;
    --pc-accent-hover: #005bb5;
    --pc-bg: #ffffff;
    --pc-text: #111111;
    --pc-text-muted: #666666;
    --pc-border: #e2e2e2;
    --pc-radius: 8px;
    --pc-font: system-ui, -apple-system, sans-serif;
    --pc-pin-size: 28px;

    font-family: var(--pc-font);
    font-size: 14px;
    line-height: 1.4;
    color: var(--pc-text);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pc-toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pc-toolbar-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: var(--pc-accent);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: background 0.15s;
    position: relative;
  }

  .pc-toolbar-btn:hover { background: var(--pc-accent-hover); }
  .pc-toolbar-btn.active { background: var(--pc-accent-hover); outline: 2px solid white; }

  .pc-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .pc-pin {
    position: fixed;
    width: var(--pc-pin-size);
    height: var(--pc-pin-size);
    border-radius: 50% 50% 50% 0;
    background: var(--pc-accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transform: rotate(-45deg) translate(-50%, -50%);
    transform-origin: top left;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    z-index: 999998;
    transition: transform 0.1s;
  }

  .pc-pin span { transform: rotate(45deg); }
  .pc-pin:hover { transform: rotate(-45deg) translate(-50%, -50%) scale(1.15); }
  .pc-pin.resolved { background: #9ca3af; }

  .pc-popover {
    position: fixed;
    width: 300px;
    background: var(--pc-bg);
    border: 1px solid var(--pc-border);
    border-radius: var(--pc-radius);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 999999;
    overflow: hidden;
  }

  .pc-popover-header {
    padding: 10px 12px;
    border-bottom: 1px solid var(--pc-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--pc-text-muted);
  }

  .pc-comment {
    padding: 10px 12px;
    border-bottom: 1px solid var(--pc-border);
  }

  .pc-comment-author {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .pc-comment-body { font-size: 13px; }

  .pc-comment-time { font-size: 11px; color: var(--pc-text-muted); margin-top: 4px; }

  .pc-input-area {
    padding: 10px 12px;
    display: flex;
    gap: 8px;
  }

  .pc-input {
    flex: 1;
    border: 1px solid var(--pc-border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    font-family: var(--pc-font);
    outline: none;
    resize: none;
  }

  .pc-input:focus { border-color: var(--pc-accent); }

  .pc-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    background: var(--pc-accent);
    color: white;
    font-size: 13px;
    cursor: pointer;
    font-family: var(--pc-font);
  }

  .pc-btn:hover { background: var(--pc-accent-hover); }

  .pc-btn-ghost {
    background: transparent;
    color: var(--pc-text-muted);
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
  }

  .pc-btn-ghost:hover { color: var(--pc-text); }

  .pc-login {
    padding: 20px;
    text-align: center;
  }

  .pc-login p {
    margin-bottom: 12px;
    color: var(--pc-text-muted);
    font-size: 13px;
  }

  .pc-crosshair { cursor: crosshair !important; }
  .pc-crosshair * { cursor: crosshair !important; }
`
```

**Step 2: Implement toolbar rendering**

```ts
// packages/ui/src/toolbar.ts
import type { Store } from '@preview-comments/core'

const COMMENT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`

export function renderToolbar(root: ShadowRoot, store: Store): HTMLElement {
  const toolbar = document.createElement('div')
  toolbar.className = 'pc-toolbar'

  const btn = document.createElement('button')
  btn.className = 'pc-toolbar-btn'
  btn.innerHTML = COMMENT_ICON
  btn.title = 'Toggle comment mode'

  const badge = document.createElement('span')
  badge.className = 'pc-badge'
  badge.style.display = 'none'
  btn.appendChild(badge)

  btn.addEventListener('click', () => {
    const { mode } = store.getState()
    store.setState({ mode: mode === 'idle' ? 'commenting' : 'idle', activeThreadId: null })
  })

  toolbar.appendChild(btn)

  // React to state changes
  store.subscribe(() => {
    const { mode, threads } = store.getState()
    btn.classList.toggle('active', mode === 'commenting')
    const unresolvedCount = threads.filter((t) => !t.resolved).length
    badge.textContent = String(unresolvedCount)
    badge.style.display = unresolvedCount > 0 ? 'flex' : 'none'
  })

  return toolbar
}
```

**Step 3: Implement the Web Component shell**

```ts
// packages/ui/src/component.ts
import {
  createStore,
  createAnchor,
  resolveAnchor,
  createOAuthManager,
  type Adapter,
  type Store,
  type OAuthManager,
  type Thread,
} from '@preview-comments/core'
import { baseStyles } from './styles'
import { renderToolbar } from './toolbar'

export class PreviewCommentsElement extends HTMLElement {
  private store: Store
  private oauth: OAuthManager | null = null
  private adapter: Adapter | null = null
  private root: ShadowRoot
  private pinsContainer!: HTMLElement
  private popoverContainer!: HTMLElement

  constructor() {
    super()
    this.store = createStore()
    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.store.subscribe(() => this.renderPins())
    this.loadThreads()
  }

  /** Programmatic configuration. */
  configure(options: { adapter: Adapter; githubClientId?: string; githubCallbackUrl?: string }) {
    this.adapter = options.adapter
    if (options.githubClientId) {
      this.oauth = createOAuthManager({
        clientId: options.githubClientId,
        callbackUrl: options.githubCallbackUrl ?? '',
      })
      const existingToken = this.oauth.getToken()
      if (existingToken) {
        this.store.setState({ user: { name: '', avatarUrl: '', token: existingToken } })
      }
    }
  }

  private render() {
    const style = document.createElement('style')
    style.textContent = baseStyles
    this.root.appendChild(style)

    const toolbar = renderToolbar(this.root, this.store)
    this.root.appendChild(toolbar)

    this.pinsContainer = document.createElement('div')
    this.root.appendChild(this.pinsContainer)

    this.popoverContainer = document.createElement('div')
    this.root.appendChild(this.popoverContainer)

    // Click handler for placing pins (listens on the host document)
    document.addEventListener('click', (e) => this.handleDocumentClick(e))
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.store.setState({ mode: 'idle', activeThreadId: null })
        document.body.classList.remove('pc-crosshair')
      }
    })

    this.store.subscribe(() => {
      const { mode } = this.store.getState()
      if (mode === 'commenting') {
        document.body.classList.add('pc-crosshair')
      } else {
        document.body.classList.remove('pc-crosshair')
      }
    })
  }

  private handleDocumentClick(e: MouseEvent) {
    const { mode, user } = this.store.getState()
    if (mode !== 'commenting') return

    // Don't capture clicks inside our own shadow DOM
    if (e.composedPath().some((el) => el === this)) return

    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      this.showLogin()
      return
    }

    const target = document.elementFromPoint(e.clientX, e.clientY)
    if (!target) return

    const anchor = createAnchor(target, e.clientX, e.clientY, window.location.pathname)
    this.showNewCommentPopover(anchor, e.clientX, e.clientY)
  }

  private showLogin() {
    this.popoverContainer.innerHTML = ''
    const popover = document.createElement('div')
    popover.className = 'pc-popover'
    popover.style.bottom = '80px'
    popover.style.right = '20px'

    const loginDiv = document.createElement('div')
    loginDiv.className = 'pc-login'

    const text = document.createElement('p')
    text.textContent = 'Sign in with GitHub to leave comments'

    const btn = document.createElement('button')
    btn.className = 'pc-btn'
    btn.textContent = 'Sign in with GitHub'
    btn.addEventListener('click', async () => {
      if (!this.oauth) return
      try {
        const token = await this.oauth.openPopup()
        this.store.setState({ user: { name: '', avatarUrl: '', token } })
        this.popoverContainer.innerHTML = ''
        this.loadThreads()
      } catch (err) {
        text.textContent = 'Authentication failed. Try again.'
      }
    })

    loginDiv.appendChild(text)
    loginDiv.appendChild(btn)
    popover.appendChild(loginDiv)
    this.popoverContainer.appendChild(popover)
  }

  private showNewCommentPopover(anchor: any, x: number, y: number) {
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

    const submitBtn = document.createElement('button')
    submitBtn.className = 'pc-btn'
    submitBtn.textContent = 'Post'
    submitBtn.addEventListener('click', async () => {
      const body = input.value.trim()
      if (!body || !this.adapter) return
      submitBtn.disabled = true
      submitBtn.textContent = '...'
      try {
        const thread = await this.adapter.createThread(anchor, body)
        const threads = [...this.store.getState().threads, thread]
        this.store.setState({ threads, mode: 'idle', activeThreadId: null })
        this.popoverContainer.innerHTML = ''
      } catch (err) {
        submitBtn.textContent = 'Error'
      }
    })

    inputArea.appendChild(input)
    inputArea.appendChild(submitBtn)
    popover.appendChild(inputArea)
    this.popoverContainer.appendChild(popover)

    input.focus()
  }

  private renderPins() {
    this.pinsContainer.innerHTML = ''
    const { threads, activeThreadId } = this.store.getState()
    const currentPath = window.location.pathname

    threads
      .filter((t) => t.anchor.pathname === currentPath)
      .forEach((thread, index) => {
        const pos = resolveAnchor(thread.anchor)
        if (!pos) return

        const pin = document.createElement('div')
        pin.className = `pc-pin${thread.resolved ? ' resolved' : ''}`
        pin.style.left = `${pos.x}px`
        pin.style.top = `${pos.y}px`
        pin.innerHTML = `<span>${index + 1}</span>`

        pin.addEventListener('click', (e) => {
          e.stopPropagation()
          if (activeThreadId === thread.id) {
            this.store.setState({ activeThreadId: null })
            this.popoverContainer.innerHTML = ''
          } else {
            this.store.setState({ activeThreadId: thread.id })
            this.showThreadPopover(thread, pos.x, pos.y)
          }
        })

        this.pinsContainer.appendChild(pin)
      })
  }

  private showThreadPopover(thread: Thread, x: number, y: number) {
    this.popoverContainer.innerHTML = ''
    const popover = document.createElement('div')
    popover.className = 'pc-popover'
    popover.style.left = `${x + 20}px`
    popover.style.top = `${y}px`

    // Header
    const header = document.createElement('div')
    header.className = 'pc-popover-header'
    header.innerHTML = `<span>${thread.anchor.pathname}</span>`

    const actions = document.createElement('div')

    const resolveBtn = document.createElement('button')
    resolveBtn.className = 'pc-btn-ghost'
    resolveBtn.textContent = thread.resolved ? 'Reopen' : 'Resolve'
    resolveBtn.addEventListener('click', async () => {
      if (!this.adapter) return
      await this.adapter.resolveThread(thread.id)
      await this.loadThreads()
    })

    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'pc-btn-ghost'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', async () => {
      if (!this.adapter) return
      await this.adapter.deleteThread(thread.id)
      const threads = this.store.getState().threads.filter((t) => t.id !== thread.id)
      this.store.setState({ threads, activeThreadId: null })
      this.popoverContainer.innerHTML = ''
    })

    actions.appendChild(resolveBtn)
    actions.appendChild(deleteBtn)
    header.appendChild(actions)
    popover.appendChild(header)

    // Comments
    for (const comment of thread.comments) {
      const commentEl = document.createElement('div')
      commentEl.className = 'pc-comment'
      commentEl.innerHTML = `
        <div class="pc-comment-author">${comment.author.name}</div>
        <div class="pc-comment-body">${comment.body}</div>
        <div class="pc-comment-time">${new Date(comment.createdAt).toLocaleString()}</div>
      `
      popover.appendChild(commentEl)
    }

    // Reply input
    const inputArea = document.createElement('div')
    inputArea.className = 'pc-input-area'

    const input = document.createElement('textarea')
    input.className = 'pc-input'
    input.placeholder = 'Reply...'
    input.rows = 1

    const replyBtn = document.createElement('button')
    replyBtn.className = 'pc-btn'
    replyBtn.textContent = 'Reply'
    replyBtn.addEventListener('click', async () => {
      const body = input.value.trim()
      if (!body || !this.adapter) return
      await this.adapter.addComment(thread.id, body)
      await this.loadThreads()
      this.showThreadPopover(
        this.store.getState().threads.find((t) => t.id === thread.id)!,
        x, y,
      )
    })

    inputArea.appendChild(input)
    inputArea.appendChild(replyBtn)
    popover.appendChild(inputArea)

    this.popoverContainer.appendChild(popover)
  }

  private async loadThreads() {
    if (!this.adapter) return
    try {
      const threads = await this.adapter.getThreads()
      this.store.setState({ threads })
    } catch {
      // Not authenticated or API error — pins just won't show
    }
  }
}
```

**Step 4: Register Web Component and export mount function**

```ts
// packages/ui/src/index.ts
import { PreviewCommentsElement } from './component'
import type { Adapter } from '@preview-comments/core'

// Register the custom element
if (typeof customElements !== 'undefined' && !customElements.get('preview-comments')) {
  customElements.define('preview-comments', PreviewCommentsElement)
}

export interface MountOptions {
  adapter: Adapter
  githubClientId?: string
  githubCallbackUrl?: string
}

/** Programmatic mount — creates and configures <preview-comments>. */
export function mount(options: MountOptions): PreviewCommentsElement {
  const el = document.createElement('preview-comments') as PreviewCommentsElement
  el.configure(options)
  document.body.appendChild(el)
  return el
}

export { PreviewCommentsElement }
```

**Step 5: Build all packages**

Run: `pnpm build`
Expected: All three packages build successfully.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): add Web Component with toolbar, pins, and popovers"
```

---

## Task 9: Vanilla HTML example

**Files:**
- Create: `examples/vanilla/index.html`
- Create: `examples/vanilla/callback.html`

**Step 1: Create example HTML page**

```html
<!-- examples/vanilla/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Comments — Vanilla Example</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { margin-bottom: 16px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>Preview Comments Demo</h1>
  <p>Click the comment button in the bottom-right to start leaving feedback.</p>

  <div class="card" data-testid="feature-card">
    <h2>Feature Card</h2>
    <p>Try clicking anywhere on this card to leave a comment pin.</p>
  </div>

  <div class="card" data-testid="settings-card">
    <h2>Settings Card</h2>
    <p>Comments are stored as GitHub PR comments.</p>
  </div>

  <script type="module">
    import { mount } from '../../packages/ui/dist/index.js'
    import { createGitHubAdapter } from '../../packages/github/dist/index.js'

    // Replace with your values
    const REPO = 'your-org/your-repo'
    const PR_NUMBER = 1
    const GITHUB_CLIENT_ID = 'your-client-id'
    const CALLBACK_URL = window.location.origin + '/examples/vanilla/callback.html'

    const adapter = createGitHubAdapter({
      repo: REPO,
      pr: PR_NUMBER,
      getToken: () => localStorage.getItem('preview-comments:github-token'),
    })

    mount({
      adapter,
      githubClientId: GITHUB_CLIENT_ID,
      githubCallbackUrl: CALLBACK_URL,
    })
  </script>
</body>
</html>
```

**Step 2: Create OAuth callback page**

```html
<!-- examples/vanilla/callback.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Authenticating...</title>
</head>
<body>
  <p>Authenticating with GitHub...</p>
  <script>
    // In production, this page would be served by your backend which
    // exchanges the ?code= for an access token using your client secret.
    //
    // For local development, you can use a proxy like:
    //   https://github.com/nickytonline/github-oauth-proxy
    //
    // Once you have the token, post it back to the opener:
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // Exchange code for token via your backend:
      // const res = await fetch('/api/github/token', { method: 'POST', body: JSON.stringify({ code }) })
      // const { access_token } = await res.json()
      // window.opener.postMessage({ type: 'preview-comments:token', token: access_token }, '*')

      document.body.innerHTML = '<p>Got authorization code. Your backend should exchange this for a token.</p>'
    } else {
      window.opener?.postMessage({ type: 'preview-comments:error', message: 'No code received' }, '*')
      window.close()
    }
  </script>
</body>
</html>
```

**Step 3: Commit**

```bash
git add -A
git commit -m "docs: add vanilla HTML example"
```

---

## Task 10: OAuth callback examples for common platforms

**Files:**
- Create: `examples/callbacks/cloudflare-worker.ts`
- Create: `examples/callbacks/nextjs-api-route.ts`
- Create: `examples/callbacks/express.ts`

**Step 1: Create example callback implementations**

```ts
// examples/callbacks/cloudflare-worker.ts
// Deploy as a Cloudflare Worker. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET as secrets.
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    if (!code) return new Response('Missing code', { status: 400 })

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const { access_token, error } = await tokenRes.json() as any
    if (error) return new Response(`OAuth error: ${error}`, { status: 400 })

    return new Response(`<script>
      window.opener.postMessage({ type: 'preview-comments:token', token: '${access_token}' }, '*')
      window.close()
    </script>`, { headers: { 'Content-Type': 'text/html' } })
  },
}
```

```ts
// examples/callbacks/nextjs-api-route.ts
// Place at app/api/preview-comments/callback/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  const { access_token, error } = await tokenRes.json()
  if (error) return NextResponse.json({ error }, { status: 400 })

  return new NextResponse(`<script>
    window.opener.postMessage({ type: 'preview-comments:token', token: '${access_token}' }, '*')
    window.close()
  </script>`, { headers: { 'Content-Type': 'text/html' } })
}
```

```ts
// examples/callbacks/express.ts
// Mount at app.get('/api/preview-comments/callback', handler)
import express from 'express'

const app = express()

app.get('/api/preview-comments/callback', async (req, res) => {
  const code = req.query.code as string
  if (!code) return res.status(400).send('Missing code')

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  const { access_token, error } = await tokenRes.json() as any
  if (error) return res.status(400).send(`OAuth error: ${error}`)

  res.type('html').send(`<script>
    window.opener.postMessage({ type: 'preview-comments:token', token: '${access_token}' }, '*')
    window.close()
  </script>`)
})
```

**Step 2: Commit**

```bash
git add -A
git commit -m "docs: add OAuth callback examples for common platforms"
```

---

## Build sequence

Tasks must be executed in order — each depends on the previous:

1. **Monorepo scaffolding** — foundation
2. **Core types & adapter interface** — shared contracts
3. **Selector generator** — needed by anchor engine
4. **Pin anchoring engine** — uses selector generator
5. **State store** — used by UI
6. **OAuth flow manager** — used by UI
7. **GitHub adapter** — implements adapter interface from task 2
8. **UI Web Component** — consumes core + adapter
9. **Vanilla example** — integration test
10. **OAuth callback examples** — documentation
