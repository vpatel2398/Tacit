/**
 * Interview Agent
 * Generates the next interview question for a knowledge holder, using:
 * - their profile (role, domains, tenure)
 * - the conversation so far
 * - relevant company document context (via vector search)
 *
 * The goal: sharp, specific questions that surface tacit knowledge —
 * not generic "tell me about your job" filler.
 */

import { chat, type ChatMessage } from './llm'

export interface HolderContext {
  name: string
  role: string | null
  department: string | null
  tenureYears: number | null
  domains: string[]
}

export interface TranscriptTurn {
  role: 'agent' | 'holder'
  content: string
}

function buildSystemPrompt(holder: HolderContext, docContext: string): string {
  const domainList = holder.domains.length > 0
    ? holder.domains.join(', ')
    : 'their areas of expertise'

  return `You are an expert knowledge-extraction interviewer. Your job is to interview a senior employee and surface the tacit, undocumented knowledge in their head — the decisions, judgment calls, failure patterns, warnings, workarounds, and rules of thumb that exist nowhere in any document.

You are interviewing:
- Name: ${holder.name}
- Role: ${holder.role || 'Senior employee'}
- Department: ${holder.department || 'N/A'}
- Tenure: ${holder.tenureYears ? `${holder.tenureYears} years` : 'long-tenured'}
- Key domains: ${domainList}

${docContext ? `Relevant excerpts from company documents (use these to ask about gaps between what's written and what they actually know):\n${docContext}\n` : ''}

INTERVIEW PRINCIPLES:
- Ask ONE focused question at a time.
- Be specific, never generic. Bad: "Tell me about your job." Good: "You mentioned the 2017 supplier issue — what early warning signs did you learn to watch for afterward?"
- Dig for the WHY behind decisions, the exceptions to the rules, the things that go wrong, and who to call when they do.
- Follow up on interesting threads. If they mention something juicy, probe deeper before moving on.
- Surface knowledge that would be lost if this person left tomorrow.
- Keep questions conversational and warm, not robotic or interrogative.
- Never ask more than one question per turn.

Output ONLY the question itself — no preamble, no "Great answer!", no meta-commentary.`
}

export async function generateNextQuestion(
  holder: HolderContext,
  transcript: TranscriptTurn[],
  docContext: string = ''
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(holder, docContext) },
  ]

  // Replay the conversation so far
  for (const turn of transcript) {
    messages.push({
      role: turn.role === 'agent' ? 'assistant' : 'user',
      content: turn.content,
    })
  }

  // If no conversation yet, prompt for the opening question
  if (transcript.length === 0) {
    messages.push({
      role: 'user',
      content: 'Please begin the interview with your first question.',
    })
  }

  const question = await chat(messages, { temperature: 0.8, maxTokens: 300 })
  return question.trim()
}
