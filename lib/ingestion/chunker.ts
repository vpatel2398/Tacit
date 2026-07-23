/**
 * Splits long text into overlapping chunks for embedding.
 *
 * Overlap matters: it prevents a concept from being split across a chunk
 * boundary and lost. Each chunk shares some text with the next.
 */

export interface TextChunk {
  content: string
  index: number
}

const DEFAULT_CHUNK_SIZE = 800      // characters (~150-200 tokens)
const DEFAULT_OVERLAP = 150         // characters of overlap between chunks

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): TextChunk[] {
  // Normalize whitespace
  const clean = text.replace(/\s+/g, ' ').trim()

  if (clean.length === 0) return []
  if (clean.length <= chunkSize) {
    return [{ content: clean, index: 0 }]
  }

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length)

    // Try to break at a sentence boundary near the end, for cleaner chunks
    if (end < clean.length) {
      const slice = clean.slice(start, end)
      const lastPeriod = slice.lastIndexOf('. ')
      const lastNewline = slice.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      // Only use the break point if it's reasonably far in (avoid tiny chunks)
      if (breakPoint > chunkSize * 0.5) {
        end = start + breakPoint + 1
      }
    }

    const content = clean.slice(start, end).trim()
    if (content.length > 0) {
      chunks.push({ content, index })
      index++
    }

    // Move start forward, keeping overlap
    start = end - overlap
    if (start <= 0 || start >= clean.length) break
    if (end >= clean.length) break
  }

  return chunks
}
