import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { HolderForm } from './HolderForm'

async function NewHolderContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: member } = await supabase
    .from('team_members')
    .select('company_id, member_role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) redirect('/onboarding')
  if (member.member_role !== 'admin') {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '14px'
        }}>
          Only admins can add Knowledge Holders.
        </div>
      </div>
    )
  }

  // Load company topics for the picker
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .eq('company_id', member.company_id)
    .order('name')

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/dashboard/holders" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
        ← Back to Knowledge Holders
      </Link>

      <div style={{ margin: '1rem 0 1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>
          Add Knowledge Holder
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Any senior person whose expertise you want to capture and preserve.
        </p>
      </div>

      <HolderForm topics={topics || []} />
    </div>
  )
}

export default function NewHolderPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <NewHolderContent />
    </Suspense>
  )
}
