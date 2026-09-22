import crypto from 'crypto'
import { cookies } from 'next/headers'
import { connectDB } from './mongodb'
import Session from '@/models/Session'
import User, { UserDocument } from '@/models/User'

export const SESSION_COOKIE = 'session_token'
export const STATE_COOKIE = 'oauth_state'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function generateToken(bytes: number): string {
  return crypto.randomBytes(bytes).toString('hex')
}

export function generateState(): string {
  return generateToken(16)
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  await connectDB()
  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await Session.create({ token, userId, expiresAt })
  return { token, expiresAt }
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await connectDB()
  await Session.deleteOne({ token })
}

/** Looks up the session from the request's cookie. Returns null if missing/expired. */
export async function getSessionUser(): Promise<UserDocument | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  await connectDB()
  const session = await Session.findOne({ token })
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null
  }
  return User.findById(session.userId)
}

/** Same as getSessionUser but returns only the user id, for API routes that just need scoping. */
export async function getSessionUserId(): Promise<string | null> {
  const user = await getSessionUser()
  return user ? String(user._id) : null
}
