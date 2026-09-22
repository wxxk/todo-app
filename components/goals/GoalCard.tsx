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
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{goal.title}</h3>
        <div className="flex shrink-0 gap-2 text-sm">
          <button onClick={() => onEdit(goal)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            수정
          </button>
          <button
            onClick={() => {
              if (confirm('이 목표를 삭제하시겠습니까?')) onDelete(goal._id)
            }}
            className="text-red-500 hover:text-red-700"
          >
            삭제
          </button>
        </div>
      </div>
      {goal.description && (
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">{goal.description}</p>
      )}
      <ProgressBar progress={goal.progress} />
    </div>
  )
}
