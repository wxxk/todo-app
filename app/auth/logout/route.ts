import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSessionByToken, SESSION_COOKIE } from '@/lib/auth'

// Returns JSON rather than a redirect: this is called via fetch() from the
// client, which navigates itself afterward (see components/layout/Sidebar.tsx).
export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await deleteSessionByToken(token)
  }
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
