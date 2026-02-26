import type { PinAnchor } from '@preview-comments/core'

const METADATA_PREFIX = '<!-- preview-comments:'
const METADATA_SUFFIX = ' -->'
const REPLY_SEPARATOR = '\n\n---\n\n'

interface SerializedComment {
  body: string
  author: string
}

export interface ParsedThread {
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
  const commentBlocks = comments.map((comment) => `**${comment.author}:**\n${comment.body}`)

  return [
    header,
    '',
    commentBlocks.join(REPLY_SEPARATOR),
    '',
    `${METADATA_PREFIX}${metadata}${METADATA_SUFFIX}`,
  ].join('\n')
}

export function parseThread(body: string): ParsedThread | null {
  const metadataStart = body.indexOf(METADATA_PREFIX)
  if (metadataStart === -1) {
    return null
  }

  const metadataJsonStart = metadataStart + METADATA_PREFIX.length
  const metadataEnd = body.indexOf(METADATA_SUFFIX, metadataJsonStart)
  if (metadataEnd === -1) {
    return null
  }

  try {
    const metadata = JSON.parse(body.slice(metadataJsonStart, metadataEnd)) as {
      anchor: PinAnchor
      resolved?: boolean
    }
    const content = body.slice(0, metadataStart).trim()
    const firstLineEnd = content.indexOf('\n')
    const withoutHeader = firstLineEnd === -1 ? '' : content.slice(firstLineEnd + 1).trim()

    const comments: SerializedComment[] = []
    if (withoutHeader) {
      const blocks = withoutHeader.split(REPLY_SEPARATOR)
      for (const block of blocks) {
        const match = block.trim().match(/^\*\*(.+?):\*\*\n([\s\S]+)$/)
        if (match) {
          comments.push({
            author: match[1].trim(),
            body: match[2].trim(),
          })
        }
      }
    }

    return {
      anchor: metadata.anchor,
      resolved: Boolean(metadata.resolved),
      comments,
    }
  } catch {
    return null
  }
}
