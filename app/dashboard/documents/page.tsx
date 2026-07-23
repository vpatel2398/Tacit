import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DocumentUpload } from './upload/DocumentUpload'

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#f3f4f6', text: '#6b7280', label: 'Pending' },
  processing: { bg: '#FAEEDA', text: '#633806', label: 'Processing' },
  processed: { bg: '#E1F5EE', text: '#0F6E56', label: 'Processed' },
  failed: { bg: '#FAECE7', text: '#712B13', label: 'Failed' },
}

async function DocumentsContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: member } = await supabase
    .from('team_members')
    .select('company_id, member_role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) redirect('/onboarding')
  const isAdmin = member.member_role === 'admin'

  const { data: documents } = await supabase
    .from('documents')
    .select('id, name, doc_type, status, uploaded_at')
    .eq('company_id', member.company_id)
    .order('uploaded_at', { ascending: false })

  // Count chunks per document
  const docIds = (documents || []).map(d => d.id)
  const chunkCounts: Record<string, number> = {}
  if (docIds.length > 0) {
    const { data: chunks } = await supabase
      .from('document_chunks')
      .select('document_id')
      .in('document_id', docIds)
    for (const c of chunks || []) {
      chunkCounts[c.document_id] = (chunkCounts[c.document_id] || 0) + 1
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>Documents</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Company documents that the system cross-references to detect knowledge gaps.
        </p>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: '1.5rem' }}>
          <DocumentUpload />
        </div>
      )}

      {!documents || documents.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2rem', textAlign: 'center', color: '#6b7280'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>▤</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
            No documents yet
          </div>
          <div style={{ fontSize: '13px' }}>
            {isAdmin ? 'Upload SOPs, policies, manuals, or reports above.' : 'An admin can upload documents.'}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden'
        }}>
          {documents.map((doc, i) => {
            const st = statusStyles[doc.status] || statusStyles.pending
            return (
              <div key={doc.id} style={{
                padding: '1rem 1.25rem',
                borderBottom: i < documents.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {doc.doc_type}
                    {chunkCounts[doc.id] ? ` · ${chunkCounts[doc.id]} chunks` : ''}
                    {' · '}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                  background: st.bg, color: st.text, fontWeight: 500, flexShrink: 0
                }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  )
}
