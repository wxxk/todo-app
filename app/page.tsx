import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import DashboardClient from './DashboardClient'

export default async function Page() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/github')
  }
  return <DashboardClient />
}
