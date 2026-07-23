'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
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
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Knowledge Layer</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Sign in to your workspace</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '10px 12px', fontSize: '13px', color: '#b91c1c', marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          style={{
            width: '100%', padding: '10px',
            background: loading ? '#9ca3af' : '#534AB7',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem'
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: 0 }}>
          No account?{' '}
          <Link href="/auth/sign-up" style={{ color: '#534AB7', textDecoration: 'none', fontWeight: '500' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}