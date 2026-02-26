# Preview Comments Widget — Design

## Overview

An open-source, framework-agnostic commenting widget for preview/staging environments. Users drop pins anywhere on a page and leave threaded comments, similar to Vercel's preview comments or Figma. Comments are stored via a pluggable backend adapter, with GitHub PR comments as the default.

**Package name:** `@preview-comments/*`
**Target users:** Internal teams reviewing PRs (devs, PMs, designers)

## Package Structure

```
preview-comments/
  packages/
    core/       — @preview-comments/core
    ui/         — @preview-comments/ui
    github/     — @preview-comments/github
  examples/
    vanilla/    — plain HTML example
    nextjs/     — Next.js integration example
```

- **`core`** — Pin anchoring engine, backend adapter interface, OAuth flow manager, state store. Zero DOM rendering. Pure TypeScript.
- **`ui`** — Web Component (`<preview-comments>`) that renders toolbar toggle, pin markers, comment threads, new-comment form. Depends on `core`. Uses Shadow DOM for style isolation.
- **`github`** — Implements the adapter interface. Maps pins/comments to GitHub PR comment bodies with embedded metadata.

## Consumer API

### Declarative (Web Component)

```html
<script type="module">
  import '@preview-comments/ui'
  import { createGitHubAdapter } from '@preview-comments/github'
</script>

<preview-comments
  adapter="github"
  repo="kimia-ai/kimia-front"
  pr="755"
  github-client-id="Ov23li..."
></preview-comments>
```

### Programmatic

```js
import { mount } from '@preview-comments/ui'
import { createGitHubAdapter } from '@preview-comments/github'

mount({
  adapter: createGitHubAdapter({ repo: 'kimia-ai/kimia-front', pr: 755 }),
  githubClientId: 'Ov23li...',
  githubCallbackUrl: 'https://your-app.com/api/preview-comments/callback',
})
```

## Pin Anchoring

When a user clicks to place a pin, we capture:

```ts
interface PinAnchor {
  selector: string         // CSS selector to nearest identifiable element
  offsetXPercent: number   // 0.0–1.0, offset from element's top-left
  offsetYPercent: number
  pageXPercent: number     // fallback: absolute page position
  pageYPercent: number
  pathname: string         // /products/123
  viewport: { width: number; height: number }
}
```

**Selector resolution priority:**
1. `data-testid` attribute (most stable)
2. `id` attribute
3. Shortest unique CSS selector path

**Rendering a pin:**
1. Find element via `selector` → position using offset percentages
2. Element not found → fall back to absolute page position percentages
3. Both fail → show pin as "orphaned" in popover

## Backend Adapter Interface

```ts
interface Comment {
  id: string
  threadId: string
  author: { name: string; avatarUrl: string }
  body: string
  createdAt: string
  resolved: boolean
}

interface Thread {
  id: string
  anchor: PinAnchor
  comments: Comment[]
  resolved: boolean
  createdAt: string
}

interface Adapter {
  getThreads(): Promise<Thread[]>
  createThread(anchor: PinAnchor, body: string): Promise<Thread>
  resolveThread(threadId: string): Promise<void>
  deleteThread(threadId: string): Promise<void>
  addComment(threadId: string, body: string): Promise<Comment>
  editComment(commentId: string, body: string): Promise<Comment>
  deleteComment(commentId: string): Promise<void>
}
```

## GitHub Adapter

Each thread maps to one GitHub PR comment. The comment body contains human-readable markdown plus hidden metadata:

```markdown
📌 **Preview comment** on `/products/123`

> This button looks misaligned on mobile

<!-- preview-comments:{"threadId":"abc","anchor":{...},"resolved":false} -->
```

Replies within a thread are appended to the same comment body with `---` separators. The adapter parses metadata on `getThreads()` and round-trips it transparently.

## OAuth Flow

1. User clicks "Sign in with GitHub" in the widget
2. Widget opens a **popup window** to `https://github.com/login/oauth/authorize?client_id=...&scope=repo`
3. GitHub redirects the popup to a **callback URL** hosted by the consumer
4. Callback endpoint exchanges the authorization code for a token (server-side, holds client secret)
5. Callback page sends token back to widget via `window.postMessage`
6. Widget stores token in `localStorage` (scoped to domain)
7. Subsequent visits reuse the token

**Consumers provide their own callback endpoint.** We ship copy-paste examples for common platforms (Cloudflare Worker, Next.js API route, Express, NestJS). The endpoint is ~20 lines of code.

## UI Design

**Toolbar:** Fixed-position toggle button in bottom-right corner. Badge shows unresolved thread count.

**Comment mode:**
1. Click toolbar toggle → cursor becomes crosshair
2. Click anywhere → pin drops, comment input appears
3. Submit → pin persists as a numbered bubble
4. ESC or toggle to exit comment mode

**Pin markers:** Numbered circles positioned on the page. Click to open thread popover.

**Thread popover:** Anchored to the pin. Shows all comments, author + timestamp, reply input, "Resolve" button, delete option for thread owner.

**Style isolation:** Shadow DOM. Minimal default theme with CSS custom properties:

```css
preview-comments {
  --pc-accent: #0070f3;
  --pc-radius: 8px;
  --pc-font: system-ui;
}
```

No UI framework — vanilla DOM manipulation to keep bundle small.

## Data Flow

```
Host page
  └─ <preview-comments> (Shadow DOM)
       ├─ Toolbar toggle
       ├─ Pin overlay (absolute positioned markers)
       └─ Thread popovers
              │
       @preview-comments/core
       ├─ State store (threads, auth)
       └─ Adapter interface
              │
       @preview-comments/github
       └─ GitHub API (PR comments)
```

**Lifecycle:**
1. Widget mounts → checks localStorage for GitHub token
2. If authenticated → `adapter.getThreads()` → render pins for current pathname
3. New pin → `adapter.createThread()` → re-render
4. Reply → `adapter.addComment()` → update thread
5. Resolve → `adapter.resolveThread()` → dim pin

**No polling for v1.** Refresh to see others' comments. Polling/WebSocket support can be added later.
