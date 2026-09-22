import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateState, STATE_COOKIE } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GITHUB_CLIENT_ID가 설정되지 않았습니다.' }, { status: 500 })
  }

  const state = generateState()
  const cookieStore = await cookies()
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300,
    path: '/',
  })

  const redirectUri = new URL('/auth/github/callback', request.url).toString()
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', 'read:user')
  authorizeUrl.searchParams.set('state', state)

  return NextResponse.redirect(authorizeUrl)
}
