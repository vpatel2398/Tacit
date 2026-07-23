import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', margin: '0 0 8px' }}>
          Knowledge Layer
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 2rem' }}>
          Your organisation&apos;s living knowledge layer — always on.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/auth/login" style={{
            padding: '10px 24px', background: '#534AB7', color: '#fff',
            borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500'
          }}>
            Sign in
          </Link>
          <Link href="/auth/sign-up" style={{
            padding: '10px 24px', background: '#fff', color: '#534AB7',
            border: '1px solid #534AB7', borderRadius: '8px',
            textDecoration: 'none', fontSize: '14px', fontWeight: '500'
          }}>
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}