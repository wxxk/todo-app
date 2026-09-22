import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import TodosClient from './TodosClient'

export default async function TodosPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/auth/github')
  }
  return <TodosClient />
}
