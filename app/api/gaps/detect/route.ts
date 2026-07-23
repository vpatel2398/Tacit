import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { detectGaps } from '@/lib/ai/gap-detector'
import { embedText } from '@/lib/ingestion/embeddings'

export const maxDuration = 180

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { holderId } = await request.json()
    if (!holderId) return NextResponse.json({ error: 'holderId required' }, { status: 400 })

    const { data: member } = await supabase
      .from('team_members')
      .select('company_id, member_role')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (!member) return NextResponse.json({ error: 'No company' }, { status: 403 })
    if (member.member_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can run gap analysis' }, { status: 403 })
    }

    const { data: holder } = await supabase
      .from('knowledge_holders')
      .select('*')
      .eq('id', holderId)
      .maybeSingle()
    if (!holder) return NextResponse.json({ error: 'Holder not found' }, { status: 404 })

    const { data: chunks } = await supabase
      .from('knowledge_chunks')
      .select('content')
      .eq('holder_id', holderId)
      .limit(100)

    const capturedKnowledge = (chunks || []).map((c: { content: string }) => c.content)

    let documentContext = ''
    try {
      const domainQuery =
        holder.domains?.join(', ') || holder.role || holder.department || 'operations'
      const queryEmbedding = await embedText(domainQuery)
      const { data: docMatches } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_count: 5,
        filter_company_id: member.company_id,
      })
      if (docMatches && docMatches.length > 0) {
        documentContext = docMatches
          .map((m: { content: string }) => `- ${m.content}`)
          .join('\n')
      }
    } catch (err) {
      console.error('Doc context error:', err)
    }

    const gaps = await detectGaps({
      name: holder.name,
      role: holder.role,
      department: holder.department,
      domains: holder.domains || [],
      capturedKnowledge,
      documentContext,
    })

    await supabase
      .from('gap_flags')
      .delete()
      .eq('holder_id', holderId)
      .eq('status', 'open')

    if (gaps.length > 0) {
      await supabase.from('gap_flags').insert(
        gaps.map(g => ({
          holder_id: holderId,
          description: `${g.description}\n\nSuggested question: ${g.suggested_question}`,
          severity: g.severity,
          status: 'open',
        }))
      )
    }

    const weight: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0.5 }
    const gapWeight = gaps.reduce((sum, g) => sum + (weight[g.severity] || 1), 0)
    const capturedWeight = capturedKnowledge.length
    const completeness =
      capturedWeight + gapWeight > 0
        ? Math.min(1, capturedWeight / (capturedWeight + gapWeight))
        : 0

    await supabase
      .from('knowledge_holders')
      .update({ knowledge_completeness: completeness })
      .eq('id', holderId)

    return NextResponse.json({
      success: true,
      gapsFound: gaps.length,
      completeness,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gap detection failed' },
      { status: 500 }
    )
  }
}
