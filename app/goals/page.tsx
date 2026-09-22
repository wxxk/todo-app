import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import GoalsClient from './GoalsClient'

export default async function GoalsPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/github')
  }
  return <GoalsClient />
}
