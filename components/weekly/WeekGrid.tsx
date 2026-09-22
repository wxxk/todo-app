'use client'

import { Todo } from '@/types'
import PriorityBadge from '@/components/shared/PriorityBadge'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface WeekGridProps {
  todos: Todo[]
  onDayClick: (dayOfWeek: number) => void
}

export default function WeekGrid({ todos, onDayClick }: WeekGridProps) {
  const byDay = Array.from({ length: 7 }, (_, i) => todos.filter((t) => t.dayOfWeek === i))

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {DAY_LABELS.map((label, i) => (
        <div
          key={label}
          onClick={() => onDayClick(i)}
          className="min-h-[120px] cursor-pointer rounded-md border border-neutral-200 p-2 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
        >
          <div className="mb-2 text-xs font-semibold text-neutral-500">{label}</div>
          <div className="space-y-1">
            {byDay[i].map((todo) => (
              <div
                key={todo._id}
                className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate">{todo.title}</span>
                  <PriorityBadge priority={todo.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
