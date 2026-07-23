'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RunGapAnalysis({
  holders,
}: {
  holders: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState(holders[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function run() {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/gaps/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holderId: selected }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed')
      } else {
        setMessage(
          `Found ${data.gapsFound} gap${data.gapsFound === 1 ? '' : 's'}. Completeness now ${Math.round(
            data.completeness * 100
          )}%.`
        )
        router.refresh()
      }
    } catch {
      setError('Connection error')
    }
    setLoading(false)
  }

  if (holders.length === 0) return null

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
        Run gap analysis
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
        Compares captured knowledge against the person&rsquo;s role, domains, and your documents to
        find what&rsquo;s missing.
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            flex: 1,
            padding: '9px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#fff',
            outline: 'none',
          }}
        >
          {holders.map(h => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={loading || !selected}
          style={{
            padding: '0 20px',
            background: loading ? '#9ca3af' : '#534AB7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Analysing...' : 'Analyse'}
        </button>
      </div>
      {message && (
        <div style={{ fontSize: '13px', color: '#0F6E56', marginTop: '10px' }}>{message}</div>
      )}
      {error && <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '10px' }}>{error}</div>}
    </div>
  )
}
