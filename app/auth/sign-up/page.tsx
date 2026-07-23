'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2rem', width: '100%', maxWidth: '400px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Check your email</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '2rem', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>
            Create your workspace
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Start capturing knowledge today
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

        {[
          { label: 'Full name', value: name, set: setName, type: 'text', placeholder: 'Vivek Shah' },
          { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@company.com' },
          { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '8+ characters' },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              {label}
            </label>
            <input
              type={type}
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        ))}

        <button
          onClick={handleSignup}
          disabled={loading || !email || !password || !name}
          style={{
            width: '100%', padding: '10px',
            background: loading ? '#9ca3af' : '#534AB7',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem', marginTop: '0.5rem'
          }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: 0 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#534AB7', textDecoration: 'none', fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}