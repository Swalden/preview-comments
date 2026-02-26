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

export function isPinAnchor(value: unknown): value is PinAnchor {
  if (typeof value !== 'object' || value === null) return false
  return PIN_ANCHOR_KEYS.every((key) => key in value)
}
