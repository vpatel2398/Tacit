import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { parseDocument, guessDocType } from '@/lib/ingestion/parser'
import { chunkText } from '@/lib/ingestion/chunker'
import { embedTexts } from '@/lib/ingestion/embeddings'

// Increase timeout for large docs (embedding takes time on CPU)
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's company + verify admin
    const { data: member } = await supabase
      .from('team_members')
      .select('company_id, member_role')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!member) {
      return NextResponse.json({ error: 'No company' }, { status: 403 })
    }
    if (member.member_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can upload documents' }, { status: 403 })
    }

    // Parse the multipart form
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name

    // 1. Create the document record (status: processing)
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        company_id: member.company_id,
        name: fileName,
        doc_type: guessDocType(fileName),
        status: 'processing',
      })
      .select()
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: docError?.message || 'Failed to create document' }, { status: 500 })
    }

    // 2. Parse → text
    let text: string
    try {
      text = await parseDocument(buffer, fileName)
    } catch (err) {
      await supabase.from('documents').update({ status: 'failed' }).eq('id', doc.id)
      return NextResponse.json({
        error: err instanceof Error ? err.message : 'Failed to parse document'
      }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      await supabase.from('documents').update({ status: 'failed' }).eq('id', doc.id)
      return NextResponse.json({ error: 'No text found in document' }, { status: 400 })
    }

    // 3. Chunk
    const chunks = chunkText(text)
    if (chunks.length === 0) {
      await supabase.from('documents').update({ status: 'failed' }).eq('id', doc.id)
      return NextResponse.json({ error: 'No chunks produced' }, { status: 400 })
    }

    // 4. Embed all chunks
    const embeddings = await embedTexts(chunks.map(c => c.content))

    // 5. Store chunks with embeddings
    const chunkRows = chunks.map((chunk, i) => ({
      document_id: doc.id,
      content: chunk.content,
      embedding: embeddings[i],
      page_number: null,
    }))

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkRows)

    if (chunkError) {
      await supabase.from('documents').update({ status: 'failed' }).eq('id', doc.id)
      return NextResponse.json({ error: chunkError.message }, { status: 500 })
    }
    

    // 6. Mark document processed
    await supabase.from('documents').update({ status: 'processed' }).eq('id', doc.id)

    return NextResponse.json({
      success: true,
      document: { id: doc.id, name: fileName, chunks: chunks.length },
    })

  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Ingestion failed'
    }, { status: 500 })
  }
}
