'use client'

import { FormEvent, useState } from 'react'
import { Goal } from '@/types'
import { formatDate, getWeekStart } from '@/lib/utils'

interface WeeklyPlanFormProps {
  goals: Goal[]
  onSubmit: (input: { weekStart: string; goals: { text: string; done: boolean }[]; memo?: string; goalId?: string }) => Promise<void>
  onCancel: () => void
}

export default function WeeklyPlanForm({ goals, onSubmit, onCancel }: WeeklyPlanFormProps) {
  const [weekStart, setWeekStart] = useState(formatDate(getWeekStart(new Date())))
  const [goalTexts, setGoalTexts] = useState<string[]>([''])
  const [memo, setMemo] = useState('')
  const [goalId, setGoalId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateGoalText(i: number, value: string) {
    setGoalTexts((prev) => prev.map((t, idx) => (idx === i ? value : t)))
  }

  function addGoalField() {
    if (goalTexts.length >= 5) return
    setGoalTexts((prev) => [...prev, ''])
  }

  function removeGoalField(i: number) {
    setGoalTexts((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        weekStart,
        goals: goalTexts.filter((t) => t.trim()).map((text) => ({ text: text.trim(), done: false })),
        memo: memo.trim() || undefined,
        goalId: goalId || undefined,
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">주 시작일</label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          주간 목표 (최대 5개)
        </label>
        <div className="space-y-2">
          {goalTexts.map((text, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={text}
                onChange={(e) => updateGoalText(i, e.target.value)}
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                placeholder={`목표 ${i + 1}`}
              />
              {goalTexts.length > 1 && (
                <button type="button" onClick={() => removeGoalField(i)} className="px-2 text-neutral-400 hover:text-red-500">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {goalTexts.length < 5 && (
          <button type="button" onClick={addGoalField} className="mt-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            + 목표 추가
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">연결할 1년 목표</label>
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          <option value="">선택 안 함</option>
          {goals.map((g) => (
            <option key={g._id} value={g._id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          저장
        </button>
      </div>
    </form>
  )
}
