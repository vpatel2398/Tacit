import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const response = NextResponse.redirect(new URL('/auth/login', 'http://localhost:3000'))
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
  return response
}

export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const response = NextResponse.redirect(new URL('/auth/sign-up', 'http://localhost:3000'))
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
  return response
}