'use client'

import { useState } from 'react'
import { createHolder } from '@/lib/holders/actions'
import { DomainPicker } from './DomainPicker'

type Topic = { id: string; name: string }

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const
}

const labelStyle = {
  fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px'
}

export function HolderForm({ topics }: { topics: Topic[] }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await createHolder(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '12px', padding: '1.5rem'
      }}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '10px 12px', fontSize: '13px', color: '#b91c1c', marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Full name *</label>
          <input name="name" required placeholder="Sarah Chen" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Role</label>
            <input name="role" placeholder="Senior Process Engineer" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input name="department" placeholder="Manufacturing" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Years at company</label>
            <input name="tenure_years" type="number" min="0" placeholder="32" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Retiring / leaving date (optional)</label>
            <input name="retiring_at" type="date" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Capture mode</label>
          <select name="capture_mode" defaultValue="hybrid" style={{ ...inputStyle, background: '#fff' }}>
            <option value="hybrid">Hybrid — interviews + passive capture</option>
            <option value="interview_only">Interviews only</option>
            <option value="passive_only">Passive capture only</option>
          </select>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
          <DomainPicker topics={topics} />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '11px', marginTop: '0.5rem',
            background: loading ? '#9ca3af' : '#534AB7',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Knowledge Holder'}
        </button>
      </div>
    </form>
  )
}
