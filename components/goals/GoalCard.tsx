'use client'

import { Goal } from '@/types'
import ProgressBar from '@/components/shared/ProgressBar'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  return (
    <div className="card-surface hover:shadow-card p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-title-md font-semibold text-ink">{goal.title}</h3>
        <div className="flex shrink-0 gap-3 text-caption">
          <button onClick={() => onEdit(goal)} className="text-muted hover:text-ink">
            수정
          </button>
          <button
            onClick={() => {
              if (confirm('이 목표를 삭제하시겠습니까?')) onDelete(goal._id)
            }}
            className="text-error hover:text-error-hover"
          >
            삭제
          </button>
        </div>
      </div>
      {goal.description && <p className="mb-3 text-body-sm text-body">{goal.description}</p>}
      <ProgressBar progress={goal.progress} />
    </div>
  )
}
