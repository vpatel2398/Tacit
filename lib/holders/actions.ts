'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper — get current user's company + admin status
async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('team_members')
    .select('id, company_id, member_role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return null
  return { supabase, member }
}

export async function createHolder(formData: FormData) {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not authenticated' }
  if (ctx.member.member_role !== 'admin') {
    return { error: 'Only admins can add Knowledge Holders.' }
  }

  const { supabase, member } = ctx

  const name = (formData.get('name') as string)?.trim()
  const role = (formData.get('role') as string)?.trim() || null
  const department = (formData.get('department') as string)?.trim() || null
  const tenureRaw = formData.get('tenure_years') as string
  const tenure_years = tenureRaw ? parseInt(tenureRaw) : null
  const retiringRaw = formData.get('retiring_at') as string
  const retiring_at = retiringRaw || null
  const capture_mode = (formData.get('capture_mode') as string) || 'hybrid'

  // Domains come as a comma-separated hidden field (topics + custom tags merged)
  const domainsRaw = (formData.get('domains') as string) || ''
  const domains = domainsRaw
    .split(',')
    .map(d => d.trim())
    .filter(Boolean)

  // Selected topic IDs (for holder_topics link)
  const topicIdsRaw = (formData.get('topic_ids') as string) || ''
  const topicIds = topicIdsRaw.split(',').map(t => t.trim()).filter(Boolean)

  if (!name) return { error: 'Name is required.' }

  // Insert the holder
  const { data: holder, error } = await supabase
    .from('knowledge_holders')
    .insert({
      company_id: member.company_id,
      name,
      role,
      department,
      tenure_years,
      retiring_at,
      capture_mode,
      domains,
      status: 'active',
    })
    .select()
    .single()

  if (error || !holder) {
    return { error: error?.message || 'Failed to create Knowledge Holder' }
  }

  // Link selected topics
  if (topicIds.length > 0) {
    await supabase.from('holder_topics').insert(
      topicIds.map(topic_id => ({
        holder_id: holder.id,
        topic_id,
        priority: 2,
      }))
    )
  }

  revalidatePath('/dashboard/holders')
  redirect(`/dashboard/holders/${holder.id}`)
}

export async function deleteHolder(holderId: string) {
  const ctx = await getContext()
  if (!ctx) return { error: 'Not authenticated' }
  if (ctx.member.member_role !== 'admin') {
    return { error: 'Only admins can delete Knowledge Holders.' }
  }

  const { error } = await ctx.supabase
    .from('knowledge_holders')
    .delete()
    .eq('id', holderId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/holders')
  return { success: true }
}
