/**
 * Q&A Engine
 * Takes a junior's question, searches the captured knowledge base,
 * and either answers it with citations or reports low confidence
 * so the question can be routed to a human.
 */

import { chatJSON } from './llm'

export interface RetrievedChunk {
  id: string
  holder_id: string
  content: string
  chunk_type: string
  source_quote: string | null
  similarity: number
}

export interface AgentAnswer {
  answer: string
  confidence: number          // 0-1 — how well the knowledge base actually answers this
  used_chunk_ids: string[]    // which chunks the answer relied on
  reasoning: string           // brief note on why confidence is what it is
}

const QA_PROMPT = `You answer employee questions using ONLY the captured institutional knowledge provided.

Rules:
- Answer ONLY from the provided knowledge chunks. Never invent facts or use outside knowledge.
- If the chunks genuinely answer the question, write a clear, direct answer and set high confidence.
- If the chunks are only tangentially related or don't cover it, say so plainly and set LOW confidence (below 0.5). It is much better to admit the knowledge base doesn't cover something than to guess.
- Cite which chunks you used by their id in used_chunk_ids.
- Keep the answer concise and practical — this is for someone trying to get work done.
- Write in plain language. Do not mention "chunks" or "the knowledge base" in the answer itself.

Confidence guide:
- 0.8-1.0: chunks directly and fully answer the question
- 0.5-0.79: chunks partially answer it; useful but incomplete
- below 0.5: chunks don't really cover this — needs a human

Return STRICT JSON:
{ "answer": "...", "confidence": 0.85, "used_chunk_ids": ["id1"], "reasoning": "..." }`

export async function answerFromKnowledge(
  question: string,
  chunks: RetrievedChunk[]
): Promise<AgentAnswer> {
  if (chunks.length === 0) {
    return {
      answer: "There's nothing captured in the knowledge base about this yet.",
      confidence: 0,
      used_chunk_ids: [],
      reasoning: 'No relevant knowledge found',
    }
  }

  const context = chunks
    .map(
      c =>
        `[id: ${c.id}] (${c.chunk_type}, relevance ${c.similarity.toFixed(2)})\n${c.content}${
          c.source_quote ? `\nOriginal words: "${c.source_quote}"` : ''
        }`
    )
    .join('\n\n')

  const result = await chatJSON<AgentAnswer>(
    [
      { role: 'system', content: QA_PROMPT },
      {
        role: 'user',
        content: `Question: "${question}"\n\nCaptured knowledge:\n${context}\n\nAnswer as JSON.`,
      },
    ],
    { temperature: 0.2, maxTokens: 800 }
  )

  return {
    answer: result.answer || 'Unable to answer.',
    confidence: typeof result.confidence === 'number' ? result.confidence : 0,
    used_chunk_ids: result.used_chunk_ids || [],
    reasoning: result.reasoning || '',
  }
}

// Above this, the agent answers directly. Below, route to a human.
export const CONFIDENCE_THRESHOLD = 0.6
