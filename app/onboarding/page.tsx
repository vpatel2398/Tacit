import { getOnboardingStatus } from '@/lib/company/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OnboardingPage() {
  const status = await getOnboardingStatus()

  if (status.status === 'unauthenticated') redirect('/auth/login')
  if (status.status === 'member') redirect('/dashboard')
  if (status.status === 'pending') redirect('/onboarding/pending')

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 6px' }}>
            Welcome to Knowledge Layer
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Let&apos;s get you set up. Create a new workspace or join your team.
          </p>
        </div>

        <Link href="/onboarding/create" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '1.5rem', marginBottom: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', background: '#EEEDFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0
            }}>🏢</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>
                Create a new company
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Set up a fresh workspace. You&apos;ll be the admin.
              </div>
            </div>
          </div>
        </Link>

        <Link href="/onboarding/join" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '1.5rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', background: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0
            }}>🤝</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>
                Join your team
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Enter an invite code from your manager to request access.
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
