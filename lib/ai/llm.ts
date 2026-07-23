/**
 * LLM abstraction — all AI features call this single chat() function.
 * Swapping providers (Groq → Claude/OpenAI) means changing ONLY this file.
 *
 * Currently: Groq (free tier), using an OpenAI-compatible endpoint.
 * Get a free key at console.groq.com (no credit card).
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Current Groq production model (older Llama chat models were deprecated).
// openai/gpt-oss-120b is free-tier and strong at reasoning + extraction.
const MODEL = 'openai/gpt-oss-120b'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  temperature?: number
  maxTokens?: number
  // If true, ask the model to return strict JSON
  json?: boolean
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Get a free key at console.groq.com')
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
  }

  if (options.json) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`LLM error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Convenience wrapper — get parsed JSON back from the model.
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  options: Omit<ChatOptions, 'json'> = {}
): Promise<T> {
  const raw = await chat(messages, { ...options, json: true })
  // Strip any accidental markdown fences
  const clean = raw.replace(/```json\s*|\s*```/g, '').trim()
  return JSON.parse(clean) as T
}
