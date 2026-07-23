import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // If already approved (now a team member), go to dashboard
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (member) redirect('/dashboard')

  // Get their pending request details
  const { data: request } = await supabase
    .from('join_requests')
    .select('status, company_id, companies(name)')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Rejected? Let them try again
  const wasRejected = request?.status === 'rejected'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '2.5rem', width: '100%', maxWidth: '440px', textAlign: 'center'
      }}>
        {wasRejected ? (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>😔</div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px' }}>
              Request not approved
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem' }}>
              Your request to join wasn't approved. Double-check the invite code with your manager and try again.
            </p>
            <a href="/onboarding/join" style={{
              display: 'inline-block', padding: '9px 20px', background: '#534AB7',
              color: '#fff', borderRadius: '8px', textDecoration: 'none',
              fontSize: '14px', fontWeight: '500'
            }}>
              Try again
            </a>
          </>
        ) : (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px' }}>
              Waiting for approval
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem' }}>
              Your request to join{' '}
              <strong>
                {/* @ts-expect-error nested relation */}
                {request?.companies?.name || 'the company'}
              </strong>{' '}
              has been sent. A manager will review it shortly. You'll get access once approved.
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
              Refresh this page to check your status.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
