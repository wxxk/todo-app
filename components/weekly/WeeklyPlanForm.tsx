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
      {error && <p className="text-body-sm text-error">{error}</p>}
      <div>
        <label className="field-label">주 시작일</label>
        <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} required className="input-field" />
      </div>

      <div>
        <label className="field-label">주간 목표 (최대 5개)</label>
        <div className="space-y-2">
          {goalTexts.map((text, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={text}
                onChange={(e) => updateGoalText(i, e.target.value)}
                className="input-field flex-1"
                placeholder={`목표 ${i + 1}`}
              />
              {goalTexts.length > 1 && (
                <button type="button" onClick={() => removeGoalField(i)} className="px-2 text-muted-soft hover:text-error">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {goalTexts.length < 5 && (
          <button type="button" onClick={addGoalField} className="btn-text mt-2">
            + 목표 추가
          </button>
        )}
      </div>

      <div>
        <label className="field-label">메모</label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} className="textarea-field" />
      </div>

      <div>
        <label className="field-label">연결할 1년 목표</label>
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)} className="input-field">
          <option value="">선택 안 함</option>
          {goals.map((g) => (
            <option key={g._id} value={g._id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          취소
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          저장
        </button>
      </div>
    </form>
  )
}
