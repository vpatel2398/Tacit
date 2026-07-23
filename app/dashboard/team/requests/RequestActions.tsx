'use client'

import { useState } from 'react'
import { approveRequest, rejectRequest } from '@/lib/company/requests'

export function RequestActions({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState('')

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    setError('')
    const result = action === 'approve'
      ? await approveRequest(requestId)
      : await rejectRequest(requestId)
    setLoading(null)
    if (result?.error) {
      setError(result.error)
    } else {
      setDone(action === 'approve' ? 'approved' : 'rejected')
    }
  }

  if (done === 'approved') {
    return <span style={{ fontSize: '13px', color: '#0F6E56', fontWeight: 500 }}>✓ Approved</span>
  }
  if (done === 'rejected') {
    return <span style={{ fontSize: '13px', color: '#9ca3af' }}>Rejected</span>
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {error && <span style={{ fontSize: '12px', color: '#b91c1c' }}>{error}</span>}
      <button
        onClick={() => handle('reject')}
        disabled={loading !== null}
        style={{
          fontSize: '13px', padding: '6px 14px', borderRadius: '6px',
          border: '1px solid #d1d5db', background: '#fff', color: '#374151',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading === 'reject' ? '...' : 'Reject'}
      </button>
      <button
        onClick={() => handle('approve')}
        disabled={loading !== null}
        style={{
          fontSize: '13px', padding: '6px 14px', borderRadius: '6px',
          border: 'none', background: '#534AB7', color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading === 'approve' ? '...' : 'Approve'}
      </button>
    </div>
  )
}
