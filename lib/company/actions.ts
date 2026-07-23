'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Check where a user should be routed based on their status
export async function getOnboardingStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'unauthenticated' as const }

  // Already a team member? → go to dashboard
  const { data: member } = await supabase
    .from('team_members')
    .select('id, company_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (member) return { status: 'member' as const, companyId: member.company_id }

  // Has a pending join request? → go to waiting screen
  const { data: request } = await supabase
    .from('join_requests')
    .select('id, status, company_id')
    .eq('auth_user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (request) return { status: 'pending' as const }

  // Otherwise → needs to create or join
  return { status: 'new' as const }
}

// Create a new company and make this user the admin
export async function createCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const name = formData.get('name') as string
  const industry = formData.get('industry') as string

  // Generate invite code via DB function
  const { data: codeData } = await supabase.rpc('generate_invite_code')
  const inviteCode = codeData as string

  // Create the company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name, industry, invite_code: inviteCode })
    .select()
    .single()

  if (companyError || !company) {
    return { error: companyError?.message || 'Failed to create company' }
  }

  // Create the team member as admin
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      company_id: company.id,
      auth_user_id: user.id,
      name: user.user_metadata?.full_name || user.email || 'Admin',
      email: user.email,
      member_role: 'admin',
      seniority_level: 'lead',
    })

  if (memberError) {
    return { error: memberError.message }
  }

  // Copy system topic templates into this company's topics
  const { data: templates } = await supabase
    .from('system_topic_templates')
    .select('name, description')

  if (templates && templates.length > 0) {
    await supabase.from('topics').insert(
      templates.map(t => ({
        company_id: company.id,
        name: t.name,
        description: t.description,
        is_system: true,
      }))
    )
  }

  redirect('/dashboard')
}

// Request to join a company via invite code
export async function requestToJoin(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const inviteCode = (formData.get('invite_code') as string).trim().toUpperCase()

  // Find the company by invite code
  const { data: company, error: findError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('invite_code', inviteCode)
    .maybeSingle()

  if (findError || !company) {
    return { error: 'Invalid invite code. Check with your manager.' }
  }

  // Create the join request
  const { error: requestError } = await supabase
    .from('join_requests')
    .insert({
      company_id: company.id,
      auth_user_id: user.id,
      requester_name: user.user_metadata?.full_name || user.email || 'Unknown',
      requester_email: user.email || '',
    })

  if (requestError) {
    if (requestError.code === '23505') {
      return { error: 'You already have a pending request for this company.' }
    }
    return { error: requestError.message }
  }

  redirect('/onboarding/pending')
}