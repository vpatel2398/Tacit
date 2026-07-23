'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRequest(requestId: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('approve_join_request', {
    request_id: requestId,
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/team/requests')
  return { success: true }
}

export async function rejectRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get the reviewer's team_member id
  const { data: reviewer } = await supabase
    .from('team_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const { error } = await supabase
    .from('join_requests')
    .update({
      status: 'rejected',
      reviewed_by: reviewer?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/team/requests')
  return { success: true }
}