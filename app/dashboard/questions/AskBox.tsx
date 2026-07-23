'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Citation = {
  id: string
  content: string
  source_quote: string | null
  chunk_type: string
}

type Result = {
  answer: string
  confidence: number
  confident: boolean
  citations: Citation[]
  routed: boolean
}

export function AskBox() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function ask() {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/questions/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setResult(data)
        router.refresh()
      }
    } catch {
      setError('Connection error')
    }
    setLoading(false)
  }

  const confidenceStyle = (c: number) =>
    c >= 0.8
      ? { bg: '#E1F5EE', text: '#0F6E56', label: 'High confidence' }
      : c >= 0.6
      ? { bg: '#FAEEDA', text: '#633806', label: 'Medium confidence' }
      : { bg: '#FAECE7', text: '#712B13', label: 'Low confidence' }

  return (
    <div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <label
          style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}
        >
          Ask the knowledge base
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!loading) ask()
              }
            }}
            rows={2}
            placeholder="e.g. Why do we avoid Supplier X for critical parts?"
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={ask}
            disabled={loading || !question.trim()}
            style={{
              padding: '0 20px',
              background: loading || !question.trim() ? '#9ca3af' : '#534AB7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>
        {error && (
          <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '8px' }}>{error}</div>
        )}
      </div>

      {result && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: 500,
                background: confidenceStyle(result.confidence).bg,
                color: confidenceStyle(result.confidence).text,
              }}
            >
              {confidenceStyle(result.confidence).label}
            </span>
            {result.routed && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Routed to a knowledge holder for review
              </span>
            )}
          </div>

          <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#111' }}>{result.answer}</div>

          {result.citations.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Based on
              </div>
              {result.citations.map(c => (
                <div
                  key={c.id}
                  style={{
                    fontSize: '13px',
                    color: '#4b5563',
                    padding: '8px 10px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '20px',
                      background: '#EEEDFE',
                      color: '#3C3489',
                      marginRight: '6px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {c.chunk_type.replace('_', ' ')}
                  </span>
                  {c.content}
                  {c.source_quote && (
                    <div
                      style={{
                        fontStyle: 'italic',
                        color: '#6b7280',
                        marginTop: '4px',
                        paddingLeft: '8px',
                        borderLeft: '2px solid #e5e7eb',
                      }}
                    >
                      &ldquo;{c.source_quote}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
