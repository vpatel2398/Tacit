import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '◈' },
  { href: '/dashboard/holders', label: 'Knowledge Holders', icon: '★' },
  { href: '/dashboard/sessions', label: 'Sessions', icon: '◎' },
  { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: '❋' },
  { href: '/dashboard/questions', label: 'Q&A', icon: '◉' },
  { href: '/dashboard/documents', label: 'Documents', icon: '▤' },
  { href: '/dashboard/gaps', label: 'Gap Flags', icon: '⚑' },
  { href: '/dashboard/team', label: 'Team', icon: '◈' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{
        width: '220px', background: '#0f0f1a', color: '#e2e8f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        borderRight: '1px solid #1e1e2e'
      }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Knowledge Layer</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Always-on intelligence</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ href, label, icon }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
                fontSize: '13px', color: '#94a3b8',
              }}>
                <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>{icon}</span>
                {label}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e2e' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
          <a href="/api/auth/signout" style={{
            marginTop: '6px', fontSize: '12px', color: '#6b7280',
            display: 'block', textDecoration: 'none', cursor: 'pointer'
          }}>
            Sign out
          </a>
        </div>
      </aside>

      <main style={{ flex: 1, background: '#f8f9fa', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}