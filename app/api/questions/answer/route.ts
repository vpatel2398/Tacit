import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { embedText } from '@/lib/ingestion/embeddings'
import { extractKnowledge } from '@/lib/ai/extraction'

export const maxDuration = 120

/**
 * A human answers a routed question.
 * Their answer is saved AND converted into a permanent knowledge chunk,
 * so the next person who asks never needs to bother anyone.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { questionId, answer } = await request.json()
    if (!questionId || !answer?.trim()) {
      return NextResponse.json({ error: 'Question and answer required' }, { status: 400 })
    }

    const { data: member } = await supabase
      .from('team_members')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!member) return NextResponse.json({ error: 'No company' }, { status: 403 })

    const { data: question } = await supabase
      .from('questions')
      .select('id, content, routed_to')
      .eq('id', questionId)
      .maybeSingle()
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    // Find a knowledge holder to attribute this to — prefer the one this
    // question was routed to, else any active holder for the company.
    let holderId: string | null = null
    if (question.routed_to) {
      const { data: h } = await supabase
        .from('knowledge_holders')
        .select('id')
        .eq('team_member_id', question.routed_to)
        .maybeSingle()
      holderId = h?.id ?? null
    }
    if (!holderId) {
      const { data: anyHolder } = await supabase
        .from('knowledge_holders')
        .select('id')
        .eq('company_id', member.company_id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
      holderId = anyHolder?.id ?? null
    }

    // Turn the answer into structured knowledge chunks
    let spawnedChunkId: string | null = null
    if (holderId) {
      try {
        const chunks = await extractKnowledge(question.content, answer)
        for (const chunk of chunks) {
          const embedding = await embedText(chunk.content)
          const { data: inserted } = await supabase
            .from('knowledge_chunks')
            .insert({
              holder_id: holderId,
              chunk_type: chunk.chunk_type,
              capture_source: 'qa_response',
              content: chunk.content,
              source_quote: chunk.source_quote,
              embedding,
              confidence: chunk.confidence,
              reviewed: false,
            })
            .select()
            .single()
          if (!spawnedChunkId && inserted) spawnedChunkId = inserted.id
        }
      } catch (err) {
        console.error('Extraction from answer failed:', err)
      }
    }

    // Update the question
    await supabase
      .from('questions')
      .update({
        status: 'answered_by_human',
        human_answer: answer,
        spawned_chunk_id: spawnedChunkId,
        answered_at: new Date().toISOString(),
      })
      .eq('id', questionId)

    return NextResponse.json({ success: true, spawnedChunkId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Answer error' },
      { status: 500 }
    )
  }
}
