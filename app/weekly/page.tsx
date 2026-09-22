import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import WeeklyClient from './WeeklyClient'

export default async function WeeklyPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/github')
  }
  return <WeeklyClient />
}
