/**
 * Gap Detection Engine
 *
 * Compares what has actually been captured from a knowledge holder against
 * what SHOULD exist given their role, domains, and the company's documents.
 * Produces prioritised gaps that feed back into the interview agent.
 */

import { chatJSON } from './llm'

export interface DetectedGap {
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  suggested_question: string
}

const GAP_PROMPT = `You are a knowledge-risk analyst. Your job is to find what is MISSING from what has been captured about a senior employee — the knowledge that would be lost if they left tomorrow.

You are given:
1. The person's role, department, and stated knowledge domains
2. Everything captured from them so far
3. Relevant excerpts from company documents

Identify specific, important gaps — knowledge that clearly should exist for someone in this role but has not been captured.

Severity guide:
- "critical": operations would break or a serious risk would go unmanaged without this
- "high": significant disruption or costly relearning
- "medium": useful but recoverable
- "low": nice to have

Rules:
- Be SPECIFIC. Bad: "More about processes." Good: "No knowledge captured about how they decide when to halt a production line."
- Only flag gaps genuinely relevant to THIS person's role and domains.
- Don't flag something already covered by the captured knowledge.
- If documents describe a process this person owns but they've said nothing about it, that's a strong gap.
- Return between 3 and 8 gaps. Prioritise quality over quantity.
- For each gap, write the exact question an interviewer should ask to close it.

Return STRICT JSON:
{ "gaps": [ { "description": "...", "severity": "high", "suggested_question": "..." } ] }`

export async function detectGaps(input: {
  name: string
  role: string | null
  department: string | null
  domains: string[]
  capturedKnowledge: string[]
  documentContext: string
}): Promise<DetectedGap[]> {
  const captured =
    input.capturedKnowledge.length > 0
      ? input.capturedKnowledge.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : '(nothing captured yet)'

  const result = await chatJSON<{ gaps: DetectedGap[] }>(
    [
      { role: 'system', content: GAP_PROMPT },
      {
        role: 'user',
        content: `PERSON
Name: ${input.name}
Role: ${input.role || 'Senior employee'}
Department: ${input.department || 'N/A'}
Stated domains: ${input.domains.join(', ') || 'not specified'}

CAPTURED SO FAR
${captured}

COMPANY DOCUMENT EXCERPTS
${input.documentContext || '(no documents available)'}

Identify the gaps as JSON.`,
      },
    ],
    { temperature: 0.4, maxTokens: 2000 }
  )

  const valid = ['critical', 'high', 'medium', 'low']
  return (result.gaps || []).filter(
    g => g.description && valid.includes(g.severity)
  )
}
