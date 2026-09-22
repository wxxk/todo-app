'use client'

import { FormEvent, useState } from 'react'
import { Goal } from '@/types'

interface GoalFormProps {
  initial?: Goal | null
  onSubmit: (input: { title: string; description?: string }) => Promise<void>
  onCancel: () => void
}

export default function GoalForm({ initial, onSubmit, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined })
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
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" placeholder="예: 백엔드 개발자로 이직하기" />
      </div>
      <div>
        <label className="field-label">설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="textarea-field" />
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
