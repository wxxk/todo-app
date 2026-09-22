'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Todo, WeeklyPlan } from '@/types'
import { useAppStore } from '@/store'
import Header from '@/components/layout/Header'
import ProgressBar from '@/components/shared/ProgressBar'
import WeeklyGoalItem from '@/components/weekly/WeeklyGoalItem'
import WeekGrid from '@/components/weekly/WeekGrid'
import TodoModal from '@/components/todos/TodoModal'
import { TodoFormValues } from '@/components/todos/TodoForm'
import { formatDate } from '@/lib/utils'

export default function WeeklyDetailClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { goals, fetchGoals, weeklyPlans, fetchWeeklyPlans } = useAppStore()

  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [retrospective, setRetrospective] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [prefillDay, setPrefillDay] = useState<number | undefined>(undefined)

  const loadPlan = useCallback(async () => {
    const res = await fetch(`/api/weekly/${id}`)
    if (!res.ok) {
      setPlan(null)
      setLoading(false)
      return
    }
    const data: WeeklyPlan = await res.json()
    setPlan(data)
    setRetrospective(data.retrospective ?? '')
    setLoading(false)
  }, [id])

  const loadTodos = useCallback(async () => {
    const res = await fetch(`/api/todos?weeklyPlanId=${id}`)
    if (res.ok) setTodos(await res.json())
  }, [id])

  useEffect(() => {
    // loadPlan/loadTodos only call setState after their internal `await fetch`
    // resolves, so this does not cause the synchronous cascading renders the rule guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlan()
    loadTodos()
    fetchGoals()
    fetchWeeklyPlans()
  }, [loadPlan, loadTodos, fetchGoals, fetchWeeklyPlans])

  async function handleToggleGoal(index: number, done: boolean) {
    if (!plan) return
    const res = await fetch(`/api/weekly/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalIndex: index, done }),
    })
    if (res.ok) setPlan(await res.json())
  }

  async function handleSaveRetrospective() {
    const res = await fetch(`/api/weekly/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals: plan?.goals, memo: plan?.memo, retrospective, goalId: plan?.goalId }),
    })
    if (res.ok) setPlan(await res.json())
  }

  function openDayModal(dayOfWeek: number) {
    setPrefillDay(dayOfWeek)
    setModalOpen(true)
  }

  async function handleCreateTodo(input: TodoFormValues) {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, weeklyPlanId: id, dayOfWeek: input.dayOfWeek ?? prefillDay }),
    })
    if (res.ok) {
      await loadTodos()
      await loadPlan()
    }
  }

  if (loading) return <p className="text-body-sm text-muted">불러오는 중...</p>
  if (!plan) {
    return (
      <div>
        <p className="mb-4 text-body-sm text-muted">주간 계획을 찾을 수 없습니다.</p>
        <button onClick={() => router.push('/weekly')} className="text-body-sm text-body underline">
          목록으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header title={`${formatDate(plan.weekStart)} 주간 계획`} />

      <section className="card-surface p-4">
        <h3 className="mb-2 text-title-sm font-semibold text-body">주간 목표</h3>
        <div className="mb-3 space-y-1">
          {plan.goals.map((g, i) => (
            <WeeklyGoalItem key={i} item={g} onToggle={(done) => handleToggleGoal(i, done)} />
          ))}
          {plan.goals.length === 0 && <p className="text-body-sm text-muted-soft">등록된 주간 목표가 없습니다.</p>}
        </div>
        <ProgressBar progress={plan.progress ?? 0} />
      </section>

      {plan.memo && (
        <section className="card-surface p-4">
          <h3 className="mb-2 text-title-sm font-semibold text-body">메모</h3>
          <p className="text-body-sm text-body">{plan.memo}</p>
        </section>
      )}

      <section className="card-surface p-4">
        <h3 className="mb-2 text-title-sm font-semibold text-body">요일별 할 일</h3>
        <WeekGrid todos={todos} onDayClick={openDayModal} />
      </section>

      <section className="card-surface p-4">
        <h3 className="mb-2 text-title-sm font-semibold text-body">회고</h3>
        <textarea
          value={retrospective}
          onChange={(e) => setRetrospective(e.target.value)}
          onBlur={handleSaveRetrospective}
          rows={4}
          placeholder="이번 주를 돌아보며 기록해보세요."
          className="textarea-field"
        />
      </section>

      <TodoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={prefillDay !== undefined ? { dayOfWeek: prefillDay, weeklyPlanId: id } : null}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={handleCreateTodo}
      />
    </div>
  )
}
