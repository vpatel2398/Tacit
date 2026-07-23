'use client'

import { useState } from 'react'
import { createCompany } from '@/lib/company/actions'
import Link from 'next/link'

const industries = [
  'Manufacturing', 'Pharmaceuticals', 'Aerospace & Defence',
  'Utilities & Energy', 'Healthcare', 'Technology', 'Financial Services',
  'Construction', 'Logistics', 'Other'
]

export default function CreateCompanyPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await createCompany(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, the action redirects — no need to handle here
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '2rem', width: '100%', maxWidth: '440px'
      }}>
        <Link href="/onboarding" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
          ← Back
        </Link>

        <div style={{ margin: '1rem 0 1.5rem' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px' }}>
            Create your company
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            You'll be set up as the admin and get an invite code to share.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '10px 12px', fontSize: '13px', color: '#b91c1c', marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form action={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              Company name
            </label>
            <input
              name="name"
              required
              placeholder="Acme Manufacturing"
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              Industry
            </label>
            <select
              name="industry"
              required
              defaultValue=""
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                background: '#fff'
              }}
            >
              <option value="" disabled>Select industry...</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '10px',
              background: loading ? '#9ca3af' : '#534AB7',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create company'}
          </button>
        </form>
      </div>
    </div>
  )
}
