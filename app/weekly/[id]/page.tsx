import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import WeeklyDetailClient from './WeeklyDetailClient'

export default async function WeeklyDetailPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/github')
  }
  return <WeeklyDetailClient />
}
