'use client'

import { FormEvent, useState } from 'react'
import { Todo, TodoPriority, Goal, WeeklyPlan } from '@/types'
import { formatDate } from '@/lib/utils'

export interface TodoFormValues {
  title: string
  description?: string
  priority: TodoPriority
  dueDate?: string
  dayOfWeek?: number
  weeklyPlanId?: string
  goalId?: string
}

interface TodoFormProps {
  initial?: Partial<Todo> | null
  goals: Goal[]
  weeklyPlans: WeeklyPlan[]
  onSubmit: (input: TodoFormValues) => Promise<void>
  onCancel: () => void
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function TodoForm({ initial, goals, weeklyPlans, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState<TodoPriority>(initial?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(initial?.dueDate ? formatDate(initial.dueDate) : '')
  const [dayOfWeek, setDayOfWeek] = useState<string>(
    initial?.dayOfWeek !== undefined && initial?.dayOfWeek !== null ? String(initial.dayOfWeek) : ''
  )
  const [weeklyPlanId, setWeeklyPlanId] = useState(initial?.weeklyPlanId ?? '')
  const [goalId, setGoalId] = useState(initial?.goalId ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        dayOfWeek: dayOfWeek === '' ? undefined : Number(dayOfWeek),
        weeklyPlanId: weeklyPlanId || undefined,
        goalId: goalId || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">
          제목 <span className="text-error">*</span>
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
      </div>

      <div>
        <label className="field-label">설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="textarea-field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">우선순위</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as TodoPriority)} className="input-field">
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
        <div>
          <label className="field-label">마감일</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">요일</label>
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="input-field">
            <option value="">선택 안 함</option>
            {DAY_LABELS.map((label, i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">주간 계획</label>
          <select value={weeklyPlanId} onChange={(e) => setWeeklyPlanId(e.target.value)} className="input-field">
            <option value="">선택 안 함</option>
            {weeklyPlans.map((p) => (
              <option key={p._id} value={p._id}>
                {formatDate(p.weekStart)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">1년 목표</label>
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
