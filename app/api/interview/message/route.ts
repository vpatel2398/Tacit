import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateNextQuestion, type HolderContext, type TranscriptTurn } from '@/lib/ai/interview-agent'
import { extractKnowledge } from '@/lib/ai/extraction'
import { embedText } from '@/lib/ingestion/embeddings'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { holderId, sessionId, answer } = await request.json()

    // Load the holder
    const { data: holder } = await supabase
      .from('knowledge_holders')
      .select('*')
      .eq('id', holderId)
      .maybeSingle()

    if (!holder) return NextResponse.json({ error: 'Holder not found' }, { status: 404 })

    const holderContext: HolderContext = {
      name: holder.name,
      role: holder.role,
      department: holder.department,
      tenureYears: holder.tenure_years,
      domains: holder.domains || [],
    }

    // Load or create the session
    let session
    if (sessionId) {
      const { data } = await supabase.from('sessions').select('*').eq('id', sessionId).maybeSingle()
      session = data
    }
    if (!session) {
      // Count existing sessions for numbering
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('holder_id', holderId)

      const { data: newSession } = await supabase
        .from('sessions')
        .insert({
          holder_id: holderId,
          session_number: (count || 0) + 1,
          session_type: 'structured_interview',
          status: 'active',
          transcript: [],
        })
        .select()
        .single()
      session = newSession
    }

    if (!session) {
      return NextResponse.json({ error: 'Could not create session' }, { status: 500 })
    }

    const transcript: TranscriptTurn[] = (session.transcript as TranscriptTurn[]) || []

    // If there's an answer, process it: record it + extract knowledge
    if (answer && answer.trim()) {
      // The last agent question is what this answer responds to
      const lastQuestion = [...transcript].reverse().find(t => t.role === 'agent')?.content || ''

      transcript.push({ role: 'holder', content: answer })

      // Extract knowledge chunks from the answer (fire and store)
      try {
        const chunks = await extractKnowledge(lastQuestion, answer)
        if (chunks.length > 0) {
          // Embed and store each chunk
          for (const chunk of chunks) {
            const embedding = await embedText(chunk.content)
            await supabase.from('knowledge_chunks').insert({
              holder_id: holderId,
              session_id: session.id,
              chunk_type: chunk.chunk_type,
              capture_source: 'interview',
              content: chunk.content,
              source_quote: chunk.source_quote,
              embedding,
              confidence: chunk.confidence,
              reviewed: false,
            })
          }
        }
      } catch (err) {
        // Extraction failure shouldn't break the interview — log and continue
        console.error('Extraction error:', err)
      }
    }

    // Get relevant document context for the next question (vector search)
    let docContext = ''
    try {
      if (transcript.length > 0) {
        const lastContent = transcript[transcript.length - 1].content
        const queryEmbedding = await embedText(lastContent)
        const { data: matches } = await supabase.rpc('match_document_chunks', {
          query_embedding: queryEmbedding,
          match_count: 3,
          filter_company_id: holder.company_id,
        })
        if (matches && matches.length > 0) {
          docContext = matches.map((m: { content: string }) => `- ${m.content}`).join('\n')
        }
      }
    } catch (err) {
      console.error('Doc context error:', err)
    }

    // Generate the next question
    const nextQuestion = await generateNextQuestion(holderContext, transcript, docContext)
    transcript.push({ role: 'agent', content: nextQuestion })

    // Save the updated transcript
    await supabase
      .from('sessions')
      .update({ transcript })
      .eq('id', session.id)

    return NextResponse.json({
      sessionId: session.id,
      question: nextQuestion,
      transcript,
    })

  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Interview error'
    }, { status: 500 })
  }
}
