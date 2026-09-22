'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store'
import { Todo } from '@/types'
import Header from '@/components/layout/Header'
import ProgressBar from '@/components/shared/ProgressBar'
import WeeklyGoalItem from '@/components/weekly/WeeklyGoalItem'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
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
        <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
          <p className="mb-3 text-sm text-neutral-500">이번 주 주간 계획이 아직 없습니다.</p>
          <Link href="/weekly" className="text-sm font-medium text-neutral-900 underline dark:text-neutral-100">
            주간 계획 만들기
          </Link>
        </div>
      )}

      {currentPlan && (
        <>
          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {formatDate(currentPlan.weekStart)} 주간 목표
              </h3>
              <Link href={`/weekly/${currentPlan._id}`} className="text-xs text-neutral-500 hover:underline">
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
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{statusCounts.todo}</p>
              <p className="text-xs text-neutral-500">할 일</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{statusCounts.doing}</p>
              <p className="text-xs text-neutral-500">진행 중</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{statusCounts.done}</p>
              <p className="text-xs text-neutral-500">완료</p>
            </div>
          </section>

          {goals.length > 0 && (
            <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">1년 목표별 이번 주 할 일</h3>
              <ul className="space-y-2">
                {goals.map((g) => (
                  <li key={g._id} className="flex items-center justify-between text-sm">
                    <Link href="/goals" className="text-neutral-700 hover:underline dark:text-neutral-300">
                      {g.title}
                    </Link>
                    <span className="text-neutral-400">{goalCounts.get(g._id) ?? 0}건</span>
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
