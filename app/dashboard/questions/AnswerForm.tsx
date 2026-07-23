'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AnswerForm({ questionId }: { questionId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/questions/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save answer')
        setLoading(false)
        return
      }
      setOpen(false)
      setAnswer('')
      router.refresh()
    } catch {
      setError('Connection error')
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: '13px',
          padding: '5px 12px',
          borderRadius: '6px',
          border: '1px solid #534AB7',
          background: '#fff',
          color: '#534AB7',
          cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        Answer this
      </button>
    )
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        rows={3}
        autoFocus
        placeholder="Share what you know — this becomes permanent knowledge, so nobody has to ask again."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      {error && <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '6px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={submit}
          disabled={loading || !answer.trim()}
          style={{
            fontSize: '13px',
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            background: loading || !answer.trim() ? '#9ca3af' : '#534AB7',
            color: '#fff',
            cursor: loading || !answer.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Save answer'}
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{
            fontSize: '13px',
            padding: '6px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
