import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { embedText } from '@/lib/ingestion/embeddings'
import {
  answerFromKnowledge,
  CONFIDENCE_THRESHOLD,
  type RetrievedChunk,
} from '@/lib/ai/qa-engine'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { question } = await request.json()
    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Who's asking
    const { data: member } = await supabase
      .from('team_members')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!member) return NextResponse.json({ error: 'No company' }, { status: 403 })

    // 1. Embed the question and search captured knowledge
    const queryEmbedding = await embedText(question)
    const { data: matches } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_count: 6,
      filter_company_id: member.company_id,
    })

    const chunks = (matches || []) as RetrievedChunk[]

    // 2. Try to answer from what we have
    const result = await answerFromKnowledge(question, chunks)

    const confident = result.confidence >= CONFIDENCE_THRESHOLD

    // 3. If not confident, pick who to route to
    let routedTo: string | null = null
    if (!confident && chunks.length > 0) {
      // Route to the knowledge holder behind the most relevant chunk,
      // if that holder is linked to a team member
      const topHolderId = chunks[0].holder_id
      const { data: holder } = await supabase
        .from('knowledge_holders')
        .select('team_member_id')
        .eq('id', topHolderId)
        .maybeSingle()
      routedTo = holder?.team_member_id ?? null
    }

    // 4. Store the question + outcome
    const { data: saved } = await supabase
      .from('questions')
      .insert({
        company_id: member.company_id,
        asked_by: member.id,
        content: question,
        status: confident ? 'answered_by_agent' : 'routed_to_human',
        agent_answer: result.answer,
        agent_confidence: result.confidence,
        answered_by_chunk_id: result.used_chunk_ids[0] || null,
        routed_to: routedTo,
        answered_at: confident ? new Date().toISOString() : null,
      })
      .select()
      .single()

    // Citations to show the user
    const citations = chunks
      .filter(c => result.used_chunk_ids.includes(c.id))
      .map(c => ({
        id: c.id,
        content: c.content,
        source_quote: c.source_quote,
        chunk_type: c.chunk_type,
      }))

    return NextResponse.json({
      questionId: saved?.id,
      answer: result.answer,
      confidence: result.confidence,
      confident,
      citations,
      routed: !confident,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Q&A error' },
      { status: 500 }
    )
  }
}
