'use client'

import { useState, useRef, useEffect } from 'react'

type Turn = { role: 'agent' | 'holder'; content: string }

export function InterviewChat({
  holderId,
  holderName,
}: {
  holderId: string
  holderName: string
}) {
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [transcript, loading])

  async function send(firstMessage = false) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/interview/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderId,
          sessionId,
          answer: firstMessage ? '' : answer,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }
      setSessionId(data.sessionId)
      setTranscript(data.transcript)
      setAnswer('')
      setStarted(true)
    } catch {
      setError('Connection error')
    }
    setLoading(false)
  }

  if (!started) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '2.5rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎙️</div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
          Start an interview with {holderName}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
          The AI interviewer will ask focused questions to surface {holderName}'s tacit knowledge.
          Every answer is automatically turned into structured, searchable knowledge.
        </p>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '10px 12px', fontSize: '13px', color: '#b91c1c', marginBottom: '1rem',
            maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto'
          }}>
            {error}
          </div>
        )}
        <button
          onClick={() => send(true)}
          disabled={loading}
          style={{
            padding: '10px 24px', background: loading ? '#9ca3af' : '#534AB7',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Starting...' : 'Begin interview'}
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '70vh'
    }}>
      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {transcript.map((turn, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: turn.role === 'holder' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: turn.role === 'holder' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: turn.role === 'holder' ? '#534AB7' : '#f3f4f6',
              color: turn.role === 'holder' ? '#fff' : '#111',
              fontSize: '14px', lineHeight: 1.5
            }}>
              {turn.role === 'agent' && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>
                  Interviewer
                </div>
              )}
              {turn.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
              background: '#f3f4f6', color: '#6b7280', fontSize: '14px'
            }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '1rem' }}>
        {error && (
          <div style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '8px' }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (answer.trim() && !loading) send()
              }
            }}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            rows={2}
            style={{
              flex: 1, padding: '10px 12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !answer.trim()}
            style={{
              padding: '0 20px', background: (loading || !answer.trim()) ? '#9ca3af' : '#534AB7',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 500,
              cursor: (loading || !answer.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
