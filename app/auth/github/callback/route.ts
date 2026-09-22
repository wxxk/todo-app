import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { createSession, STATE_COOKIE, SESSION_COOKIE } from '@/lib/auth'

interface GitHubTokenResponse {
  access_token?: string
  error?: string
}

interface GitHubUserResponse {
  id: number
  login: string
  avatar_url: string
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  const cookieStore = await cookies()
  const expectedState = cookieStore.get(STATE_COOKIE)?.value
  cookieStore.delete(STATE_COOKIE)

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: '유효하지 않은 인증 요청입니다.' }, { status: 400 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'GitHub OAuth 설정이 누락되었습니다.' }, { status: 500 })
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: new URL('/auth/github/callback', request.url).toString(),
    }),
  })
  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'GitHub 토큰 교환에 실패했습니다.' }, { status: 502 })
  }
  const tokenData: GitHubTokenResponse = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.json({ error: 'GitHub 토큰 교환에 실패했습니다.' }, { status: 502 })
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!userRes.ok) {
    return NextResponse.json({ error: 'GitHub 사용자 정보를 가져오지 못했습니다.' }, { status: 502 })
  }
  const ghUser: GitHubUserResponse = await userRes.json()

  await connectDB()
  const user = await User.findOneAndUpdate(
    { githubId: String(ghUser.id) },
    { githubId: String(ghUser.id), username: ghUser.login, avatarUrl: ghUser.avatar_url },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  )

  const { token, expiresAt } = await createSession(String(user._id))
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })

  return NextResponse.redirect(new URL('/todos', request.url))
}
