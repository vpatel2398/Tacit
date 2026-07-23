/**
 * Knowledge Extraction
 * Reads a holder's answer and extracts structured, typed knowledge chunks.
 * Each chunk is one discrete piece of knowledge, classified by type.
 */

import { chatJSON } from './llm'

export type ChunkType =
  | 'decision'
  | 'heuristic'
  | 'failure_pattern'
  | 'process'
  | 'contact'
  | 'warning'
  | 'tribal_rule'
  | 'workaround'

export interface ExtractedChunk {
  chunk_type: ChunkType
  content: string        // clean, self-contained statement of the knowledge
  source_quote: string   // the holder's actual words this came from
  confidence: number     // 0-1, how clearly this was a real piece of knowledge
}

const EXTRACTION_PROMPT = `You extract discrete pieces of tacit knowledge from an expert's interview answer.

For the answer provided, identify each distinct piece of valuable, reusable knowledge and classify it. Return STRICT JSON only.

Chunk types:
- "decision": a choice they made and the reasoning behind it
- "heuristic": a rule of thumb or mental shortcut they apply
- "failure_pattern": something that went wrong + the lesson learned
- "process": how something is done, step by step
- "contact": a key relationship — who to call for what
- "warning": something to avoid or watch out for
- "tribal_rule": an unwritten norm only insiders know
- "workaround": an unofficial fix for a broken/slow official process

Rules:
- Extract only REAL, reusable knowledge. Skip pleasantries, filler, and vague statements.
- Each chunk must be self-contained — understandable without the surrounding conversation.
- "content" = a clean paraphrase of the knowledge. "source_quote" = their actual words (short).
- confidence: 1.0 = unmistakably valuable knowledge; 0.5 = borderline; below 0.4 = skip it.
- If the answer contains no real knowledge, return an empty array.

Return this exact JSON shape:
{ "chunks": [ { "chunk_type": "...", "content": "...", "source_quote": "...", "confidence": 0.9 } ] }`

export async function extractKnowledge(
  question: string,
  answer: string
): Promise<ExtractedChunk[]> {
  const result = await chatJSON<{ chunks: ExtractedChunk[] }>(
    [
      { role: 'system', content: EXTRACTION_PROMPT },
      {
        role: 'user',
        content: `Question asked: "${question}"\n\nExpert's answer: "${answer}"\n\nExtract the knowledge chunks as JSON.`,
      },
    ],
    { temperature: 0.3, maxTokens: 1500 }
  )

  // Filter out low-confidence noise
  return (result.chunks || []).filter(c => c.confidence >= 0.4)
}
