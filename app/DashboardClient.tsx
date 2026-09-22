'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store'
import { Todo } from '@/types'
import Header from '@/components/layout/Header'
import ProgressBar from '@/components/shared/ProgressBar'
import WeeklyGoalItem from '@/components/weekly/WeeklyGoalItem'
import { formatDate } from '@/lib/utils'

export default function DashboardClient() {
  const { currentPlan, fetchCurrentPlan, goals, fetchGoals } = useAppStore()
  const [weekTodos, setWeekTodos] = useState<Todo[]>([])

  useEffect(() => {
    fetchCurrentPlan()
    fetchGoals()
  }, [fetchCurrentPlan, fetchGoals])

  useEffect(() => {
    if (!currentPlan) return
    fetch(`/api/todos?weeklyPlanId=${currentPlan._id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setWeekTodos)
  }, [currentPlan])

  async function handleToggleGoal(index: number, done: boolean) {
    if (!currentPlan) return
    const res = await fetch(`/api/weekly/${currentPlan._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalIndex: index, done }),
    })
    if (res.ok) {
      await fetchCurrentPlan()
    }
  }

  const statusCounts = useMemo(
    () => ({
      todo: weekTodos.filter((t) => t.status === 'todo').length,
      doing: weekTodos.filter((t) => t.status === 'doing').length,
      done: weekTodos.filter((t) => t.status === 'done').length,
    }),
    [weekTodos]
  )

  const goalCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of weekTodos) {
      if (t.goalId) map.set(t.goalId, (map.get(t.goalId) ?? 0) + 1)
    }
    return map
  }, [weekTodos])

  return (
    <div className="space-y-6">
      <Header title="대시보드" description="이번 주 현황을 한눈에 확인하세요." />

      {!currentPlan && (
        <div className="rounded-md border border-dashed border-border-strong p-6 text-center">
          <p className="mb-3 text-body-sm text-muted">이번 주 주간 계획이 아직 없습니다.</p>
          <Link href="/weekly" className="text-body-sm font-medium text-ink underline">
            주간 계획 만들기
          </Link>
        </div>
      )}

      {currentPlan && (
        <>
          <section className="card-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-title-sm font-semibold text-body">{formatDate(currentPlan.weekStart)} 주간 목표</h3>
              <Link href={`/weekly/${currentPlan._id}`} className="text-caption-sm text-muted hover:underline">
                상세 보기 →
              </Link>
            </div>
            <div className="mb-3 space-y-1">
              {currentPlan.goals.map((g, i) => (
                <WeeklyGoalItem key={i} item={g} onToggle={(done) => handleToggleGoal(i, done)} />
              ))}
            </div>
            <ProgressBar progress={currentPlan.progress ?? 0} />
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card-surface p-4 text-center">
              <p className="text-[40px] leading-tight font-bold text-ink">{statusCounts.todo}</p>
              <p className="text-caption-sm text-muted">할 일</p>
            </div>
            <div className="card-surface p-4 text-center">
              <p className="text-[40px] leading-tight font-bold text-ink">{statusCounts.doing}</p>
              <p className="text-caption-sm text-muted">진행 중</p>
            </div>
            <div className="card-surface p-4 text-center">
              <p className="text-[40px] leading-tight font-bold text-primary">{statusCounts.done}</p>
              <p className="text-caption-sm text-muted">완료</p>
            </div>
          </section>

          {goals.length > 0 && (
            <section className="card-surface p-4">
              <h3 className="mb-3 text-title-sm font-semibold text-body">1년 목표별 이번 주 할 일</h3>
              <ul className="space-y-2">
                {goals.map((g) => (
                  <li key={g._id} className="flex items-center justify-between text-body-sm">
                    <Link href="/goals" className="text-body hover:underline">
                      {g.title}
                    </Link>
                    <span className="text-muted-soft">{goalCounts.get(g._id) ?? 0}건</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
